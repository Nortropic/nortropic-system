#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#define DOC_MAX (1024U * 1024U)
#define TEXT_MAX 4096U
#define PROBE_MAX 128U

typedef struct { const unsigned char *s; size_t n, i; } Parser;
typedef struct {
  char candidate[41], spec[65], gate[65], probe[TEXT_MAX], request[65];
  char result[16], effect[65];
} Evidence;
typedef struct {
  char request[65], candidate[41], probe[TEXT_MAX], path[TEXT_MAX];
  char probe_sha[65], marker[TEXT_MAX];
} Receipt;
typedef struct {
  char probe[TEXT_MAX], path[TEXT_MAX], probe_sha[65], marker[TEXT_MAX], result[16];
} Probe;
typedef struct { Probe probes[PROBE_MAX]; size_t count; } Allowlist;

static int utf8_ok(const unsigned char *s, size_t n) {
  size_t i = 0;
  while (i < n) {
    unsigned c = s[i++];
    if (c < 0x80) continue;
    unsigned need, min, value;
    if ((c & 0xe0) == 0xc0) { need = 1; min = 0x80; value = c & 0x1f; }
    else if ((c & 0xf0) == 0xe0) { need = 2; min = 0x800; value = c & 0x0f; }
    else if ((c & 0xf8) == 0xf0) { need = 3; min = 0x10000; value = c & 0x07; }
    else return 0;
    if (i + need > n) return 0;
    for (unsigned j = 0; j < need; ++j) {
      unsigned d = s[i++];
      if ((d & 0xc0) != 0x80) return 0;
      value = (value << 6) | (d & 0x3f);
    }
    if (value < min || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) return 0;
  }
  return 1;
}

static void ws(Parser *p) {
  while (p->i < p->n && (p->s[p->i] == ' ' || p->s[p->i] == '\n' ||
                         p->s[p->i] == '\r' || p->s[p->i] == '\t')) p->i++;
}
static int ch(Parser *p, unsigned char wanted) {
  ws(p); if (p->i >= p->n || p->s[p->i] != wanted) return 0; p->i++; return 1;
}
static int hex4(Parser *p, unsigned *value) {
  unsigned v = 0;
  if (p->i + 4 > p->n) return 0;
  for (unsigned j = 0; j < 4; ++j) {
    unsigned c = p->s[p->i++], d;
    if (c >= '0' && c <= '9') d = c - '0';
    else if (c >= 'a' && c <= 'f') d = c - 'a' + 10;
    else if (c >= 'A' && c <= 'F') d = c - 'A' + 10;
    else return 0;
    v = (v << 4) | d;
  }
  *value = v; return 1;
}
static int append_utf8(char *out, size_t cap, size_t *used, unsigned v) {
  unsigned char b[4]; size_t count;
  if (v < 0x80) { b[0] = (unsigned char)v; count = 1; }
  else if (v < 0x800) { b[0] = 0xc0 | (v >> 6); b[1] = 0x80 | (v & 63); count = 2; }
  else if (v < 0x10000) { b[0] = 0xe0 | (v >> 12); b[1] = 0x80 | ((v >> 6) & 63); b[2] = 0x80 | (v & 63); count = 3; }
  else { b[0] = 0xf0 | (v >> 18); b[1] = 0x80 | ((v >> 12) & 63); b[2] = 0x80 | ((v >> 6) & 63); b[3] = 0x80 | (v & 63); count = 4; }
  if (*used + count >= cap) return 0;
  memcpy(out + *used, b, count); *used += count; return 1;
}
static int string(Parser *p, char *out, size_t cap) {
  size_t used = 0; ws(p);
  if (!cap || p->i >= p->n || p->s[p->i++] != '"') return 0;
  while (p->i < p->n) {
    unsigned c = p->s[p->i++];
    if (c == '"') { out[used] = 0; return 1; }
    if (c < 0x20) return 0;
    if (c != '\\') {
      if (used + 1 >= cap) return 0; out[used++] = (char)c; continue;
    }
    if (p->i >= p->n) return 0;
    c = p->s[p->i++];
    if (c == '"' || c == '\\' || c == '/') {
      if (used + 1 >= cap) return 0; out[used++] = (char)c;
    } else if (c == 'b' || c == 'f' || c == 'n' || c == 'r' || c == 't') {
      static const char escaped[] = "\b\f\n\r\t";
      static const char names[] = "bfnrt";
      const char *hit = strchr(names, (int)c);
      if (!hit || used + 1 >= cap) return 0; out[used++] = escaped[hit - names];
    } else if (c == 'u') {
      unsigned v, low;
      if (!hex4(p, &v)) return 0;
      if (v >= 0xd800 && v <= 0xdbff) {
        if (p->i + 2 > p->n || p->s[p->i++] != '\\' || p->s[p->i++] != 'u' ||
            !hex4(p, &low) || low < 0xdc00 || low > 0xdfff) return 0;
        v = 0x10000 + ((v - 0xd800) << 10) + (low - 0xdc00);
      } else if (v >= 0xdc00 && v <= 0xdfff) return 0;
      if (!append_utf8(out, cap, &used, v)) return 0;
    } else return 0;
  }
  return 0;
}
static int field(Parser *p, int first, const char *wanted) {
  char key[128];
  if (!first && !ch(p, ',')) return 0;
  return string(p, key, sizeof key) && strcmp(key, wanted) == 0 && ch(p, ':');
}
static int one(Parser *p) {
  ws(p); if (p->i >= p->n || p->s[p->i++] != '1') return 0;
  if (p->i < p->n && ((p->s[p->i] >= '0' && p->s[p->i] <= '9') ||
                      p->s[p->i] == '.' || p->s[p->i] == 'e' || p->s[p->i] == 'E')) return 0;
  return 1;
}
static int end_document(Parser *p) { ws(p); return p->i == p->n; }
static int fixed(Parser *p, const char *wanted) {
  char value[128]; return string(p, value, sizeof value) && strcmp(value, wanted) == 0;
}
static int lower_hex(const char *s, size_t n) {
  if (strlen(s) != n) return 0;
  for (size_t i = 0; i < n; ++i) if (!((s[i] >= '0' && s[i] <= '9') || (s[i] >= 'a' && s[i] <= 'f'))) return 0;
  return 1;
}
static int nonempty(const char *s) { return s[0] != 0; }

static int parse_evidence(const unsigned char *raw, size_t n, Evidence *e) {
  Parser p = {raw, n, 0}; memset(e, 0, sizeof *e);
  return utf8_ok(raw,n) && ch(&p,'{')
    && field(&p,1,"schema_version") && one(&p)
    && field(&p,0,"producer_authority") && fixed(&p,"_nortropic_provenance")
    && field(&p,0,"task") && fixed(&p,"h-033")
    && field(&p,0,"candidate_sha") && string(&p,e->candidate,sizeof e->candidate) && lower_hex(e->candidate,40)
    && field(&p,0,"task_spec_sha256") && string(&p,e->spec,sizeof e->spec) && lower_hex(e->spec,64)
    && field(&p,0,"gate_sha256") && string(&p,e->gate,sizeof e->gate) && lower_hex(e->gate,64)
    && field(&p,0,"probe_identity") && string(&p,e->probe,sizeof e->probe) && nonempty(e->probe)
    && field(&p,0,"request_id") && string(&p,e->request,sizeof e->request) && lower_hex(e->request,64)
    && field(&p,0,"result") && string(&p,e->result,sizeof e->result)
    && (!strcmp(e->result,"PASS") || !strcmp(e->result,"FAIL") || !strcmp(e->result,"ODÖMBART"))
    && field(&p,0,"effect_sha256") && string(&p,e->effect,sizeof e->effect) && lower_hex(e->effect,64)
    && ch(&p,'}') && end_document(&p);
}
static int parse_receipt(const unsigned char *raw, size_t n, Receipt *r) {
  Parser p = {raw,n,0}; memset(r,0,sizeof *r);
  return utf8_ok(raw,n) && ch(&p,'{')
    && field(&p,1,"schema_version") && one(&p)
    && field(&p,0,"observer_authority") && fixed(&p,"root-owned-h033-observer-v1")
    && field(&p,0,"request_id") && string(&p,r->request,sizeof r->request) && lower_hex(r->request,64)
    && field(&p,0,"candidate_sha") && string(&p,r->candidate,sizeof r->candidate) && lower_hex(r->candidate,40)
    && field(&p,0,"probe_identity") && string(&p,r->probe,sizeof r->probe) && nonempty(r->probe)
    && field(&p,0,"probe_path") && string(&p,r->path,sizeof r->path) && r->path[0]=='/'
    && field(&p,0,"probe_sha256") && string(&p,r->probe_sha,sizeof r->probe_sha) && lower_hex(r->probe_sha,64)
    && field(&p,0,"effect_marker") && string(&p,r->marker,sizeof r->marker) && nonempty(r->marker)
    && ch(&p,'}') && end_document(&p);
}
static int parse_probe(Parser *p, Probe *v) {
  memset(v,0,sizeof *v);
  return ch(p,'{')
    && field(p,1,"probe_identity") && string(p,v->probe,sizeof v->probe) && nonempty(v->probe)
    && field(p,0,"probe_path") && string(p,v->path,sizeof v->path) && v->path[0]=='/'
    && field(p,0,"probe_sha256") && string(p,v->probe_sha,sizeof v->probe_sha) && lower_hex(v->probe_sha,64)
    && field(p,0,"effect_marker") && string(p,v->marker,sizeof v->marker) && nonempty(v->marker)
    && field(p,0,"result") && string(p,v->result,sizeof v->result)
    && (!strcmp(v->result,"PASS") || !strcmp(v->result,"FAIL") || !strcmp(v->result,"ODÖMBART"))
    && ch(p,'}');
}
static int parse_allowlist(const unsigned char *raw, size_t n, Allowlist *a) {
  Parser p={raw,n,0}; memset(a,0,sizeof *a);
  if (!utf8_ok(raw,n) || !ch(&p,'{') || !field(&p,1,"schema_version") || !one(&p)
      || !field(&p,0,"probes") || !ch(&p,'[')) return 0;
  ws(&p); if (p.i < p.n && p.s[p.i] == ']') return 0;
  for (;;) {
    if (a->count == PROBE_MAX || !parse_probe(&p,&a->probes[a->count])) return 0;
    for (size_t j=0;j<a->count;++j) if (!strcmp(a->probes[j].probe,a->probes[a->count].probe)) return 0;
    a->count++; ws(&p);
    if (p.i < p.n && p.s[p.i] == ']') { p.i++; break; }
    if (!ch(&p,',')) return 0;
  }
  return ch(&p,'}') && end_document(&p);
}

typedef struct { uint32_t h[8]; uint64_t bits; unsigned char block[64]; size_t used; } Sha256;
static uint32_t rr(uint32_t x,unsigned n){return (x>>n)|(x<<(32-n));}
static void sha_block(Sha256 *s,const unsigned char *b){
  static const uint32_t k[64]={
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2};
  uint32_t w[64]; for(int i=0;i<16;i++)w[i]=(uint32_t)b[4*i]<<24|(uint32_t)b[4*i+1]<<16|(uint32_t)b[4*i+2]<<8|b[4*i+3];
  for(int i=16;i<64;i++){uint32_t x=w[i-15],y=w[i-2];w[i]=w[i-16]+(rr(x,7)^rr(x,18)^(x>>3))+w[i-7]+(rr(y,17)^rr(y,19)^(y>>10));}
  uint32_t a=s->h[0],c=s->h[2],d=s->h[3],e=s->h[4],f=s->h[5],g=s->h[6],h=s->h[7],bb=s->h[1];
  for(int i=0;i<64;i++){uint32_t s1=rr(e,6)^rr(e,11)^rr(e,25),chh=(e&f)^((~e)&g),t1=h+s1+chh+k[i]+w[i],s0=rr(a,2)^rr(a,13)^rr(a,22),maj=(a&bb)^(a&c)^(bb&c),t2=s0+maj;h=g;g=f;f=e;e=d+t1;d=c;c=bb;bb=a;a=t1+t2;}
  s->h[0]+=a;s->h[1]+=bb;s->h[2]+=c;s->h[3]+=d;s->h[4]+=e;s->h[5]+=f;s->h[6]+=g;s->h[7]+=h;
}
static void sha_init(Sha256*s){uint32_t h[8]={0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19};memcpy(s->h,h,sizeof h);s->bits=0;s->used=0;}
static void sha_add(Sha256*s,const unsigned char*p,size_t n){s->bits+=(uint64_t)n*8;while(n){size_t take=64-s->used;if(take>n)take=n;memcpy(s->block+s->used,p,take);s->used+=take;p+=take;n-=take;if(s->used==64){sha_block(s,s->block);s->used=0;}}}
static void sha_final(Sha256*s,char out[65]){s->block[s->used++]=0x80;if(s->used>56){while(s->used<64)s->block[s->used++]=0;sha_block(s,s->block);s->used=0;}while(s->used<56)s->block[s->used++]=0;for(int i=7;i>=0;i--)s->block[s->used++]=(unsigned char)(s->bits>>(8*i));sha_block(s,s->block);for(int i=0;i<8;i++)sprintf(out+8*i,"%08x",s->h[i]);out[64]=0;}
static void digest(const unsigned char*p,size_t n,char out[65]){Sha256 s;sha_init(&s);sha_add(&s,p,n);sha_final(&s,out);}

static int same_stat(const struct stat *a,const struct stat *b){
  return a->st_dev==b->st_dev && a->st_ino==b->st_ino && a->st_mode==b->st_mode &&
    a->st_uid==b->st_uid && a->st_gid==b->st_gid && a->st_size==b->st_size &&
    a->st_mtimespec.tv_sec==b->st_mtimespec.tv_sec && a->st_mtimespec.tv_nsec==b->st_mtimespec.tv_nsec;
}
static int read_at(int fd,unsigned char *buf,size_t n){size_t at=0;while(at<n){ssize_t got=pread(fd,buf+at,n-at,(off_t)at);if(got<=0)return 0;at+=(size_t)got;}return 1;}
static int stable_read(int fd,unsigned char **out,size_t *length){
  struct stat a,b,c;if(fstat(fd,&a)||!S_ISREG(a.st_mode)||a.st_size<=0||(uint64_t)a.st_size>DOC_MAX)return 0;
  size_t n=(size_t)a.st_size;unsigned char *one=malloc(n),*two=malloc(n);if(!one||!two){free(one);free(two);return 0;}
  int ok=read_at(fd,one,n)&&fstat(fd,&b)==0&&same_stat(&a,&b)&&read_at(fd,two,n)&&fstat(fd,&c)==0&&same_stat(&b,&c)&&!memcmp(one,two,n);
  free(two);if(!ok){free(one);return 0;}*out=one;*length=n;return 1;
}
static int decimal_fd(const char*s,int*out){if(!s||!*s)return 0;long v=0;for(;*s;s++){if(*s<'0'||*s>'9')return 0;v=v*10+(*s-'0');if(v>INT_MAX)return 0;}*out=(int)v;return 1;}

typedef struct { int efd,rfd,afd; const char *candidate,*spec,*gate,*probe,*request,*result; } Args;
static int args(int ac,char **av,Args *a){
  if(ac!=22||strcmp(av[1],"h033-verify"))return 0;memset(a,0,sizeof *a);a->efd=a->rfd=a->afd=-1;
  unsigned seen=0;
  for(int i=2;i<ac;i+=2){const char*k=av[i],*v=av[i+1];unsigned bit=0;
    if(!strcmp(k,"--evidence-fd")){bit=1;if(!decimal_fd(v,&a->efd))return 0;}
    else if(!strcmp(k,"--receipt-fd")){bit=2;if(!decimal_fd(v,&a->rfd))return 0;}
    else if(!strcmp(k,"--allowlist-fd")){bit=4;if(!decimal_fd(v,&a->afd))return 0;}
    else if(!strcmp(k,"--task")){bit=8;if(strcmp(v,"h-033"))return 0;}
    else if(!strcmp(k,"--candidate")){bit=16;a->candidate=v;if(!lower_hex(v,40))return 0;}
    else if(!strcmp(k,"--task-spec-sha256")){bit=32;a->spec=v;if(!lower_hex(v,64))return 0;}
    else if(!strcmp(k,"--gate-sha256")){bit=64;a->gate=v;if(!lower_hex(v,64))return 0;}
    else if(!strcmp(k,"--probe")){bit=128;a->probe=v;if(!*v||strlen(v)>=TEXT_MAX)return 0;}
    else if(!strcmp(k,"--request-id")){bit=256;a->request=v;if(!lower_hex(v,64))return 0;}
    else if(!strcmp(k,"--require-result")){bit=512;a->result=v;if(strcmp(v,"PASS")&&strcmp(v,"FAIL")&&strcmp(v,"ODÖMBART"))return 0;}
    else return 0;if(seen&bit)return 0;seen|=bit;
  }
  return seen==1023;
}
static int verify(const Args*a,const Evidence*e,const Receipt*r,const Allowlist*l,const unsigned char*receipt_raw,size_t receipt_n){
  char effect[65];digest(receipt_raw,receipt_n,effect);
  if(strcmp(e->candidate,a->candidate)||strcmp(e->spec,a->spec)||strcmp(e->gate,a->gate)||strcmp(e->probe,a->probe)||strcmp(e->request,a->request)||strcmp(e->result,a->result)||strcmp(e->effect,effect))return 0;
  if(strcmp(r->candidate,a->candidate)||strcmp(r->probe,a->probe)||strcmp(r->request,a->request))return 0;
  size_t matches=0;
  for(size_t i=0;i<l->count;i++)if(!strcmp(l->probes[i].probe,a->probe)){
    matches++;
    if(strcmp(l->probes[i].path,r->path)||strcmp(l->probes[i].probe_sha,r->probe_sha)||strcmp(l->probes[i].marker,r->marker)||strcmp(l->probes[i].result,a->result))return 0;
  }
  return matches==1;
}

int main(int ac,char **av){
  Args a;unsigned char *er=0,*rr=0,*ar=0;size_t en=0,rn=0,an=0;Evidence e;Receipt r;Allowlist l;int ok=0;
  if(!args(ac,av,&a))return 1;
  if(!stable_read(a.efd,&er,&en)||!stable_read(a.rfd,&rr,&rn)||!stable_read(a.afd,&ar,&an))goto done;
  if(!parse_evidence(er,en,&e)||!parse_receipt(rr,rn,&r)||!parse_allowlist(ar,an,&l))goto done;
  if(!verify(&a,&e,&r,&l,rr,rn))goto done;
  printf("VERIFIED_RESULT=%s\nREQUEST_ID=%s\nEFFECT_SHA256=%s\n",e.result,e.request,e.effect);ok=1;
done: free(er);free(rr);free(ar);return ok?0:1;
}
