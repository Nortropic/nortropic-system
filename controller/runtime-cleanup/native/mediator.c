#define _DARWIN_C_SOURCE 1
#include <arpa/inet.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <libproc.h>
#include <mach-o/dyld.h>
#include <poll.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/proc_info.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/stdio.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/un.h>
#include <unistd.h>

extern char **environ;
int main(int argc,char **argv);

#define CLIENT_UID 501
#define CLIENT_GID 20
#define FRAME_MAX 16384U
#define FILE_MAX (1024U * 1024U)
#define TREE_FILES_MAX 4096U
#define TREE_BYTES_MAX (64ULL * 1024ULL * 1024ULL)
#define TREE_DEPTH_MAX 64U
#define NS "/private/var/db/nortropic-runtime-cleanup-v1"
#define INSTALLED "/Library/PrivilegedHelperTools/se.nortropic.runtime-cleanup-mediator"
#define PYTHON_SOURCE "/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/Resources/Python.app/Contents/MacOS/Python"
#define PYTHON_SHA256 "9ea12d11e0573548d6d8b0added1740b2d6377366081dbca05c19746ce7c616e"

typedef struct {
  uint32_t h[8]; uint64_t bits; unsigned char block[64]; size_t used;
} Sha256;

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
  uint32_t w[64];
  for(int i=0;i<16;i++)w[i]=(uint32_t)b[4*i]<<24|(uint32_t)b[4*i+1]<<16|(uint32_t)b[4*i+2]<<8|b[4*i+3];
  for(int i=16;i<64;i++){uint32_t x=w[i-15],y=w[i-2];w[i]=w[i-16]+(rr(x,7)^rr(x,18)^(x>>3))+w[i-7]+(rr(y,17)^rr(y,19)^(y>>10));}
  uint32_t a=s->h[0],bb=s->h[1],c=s->h[2],d=s->h[3],e=s->h[4],f=s->h[5],g=s->h[6],h=s->h[7];
  for(int i=0;i<64;i++){uint32_t s1=rr(e,6)^rr(e,11)^rr(e,25),ch=(e&f)^((~e)&g),t1=h+s1+ch+k[i]+w[i],s0=rr(a,2)^rr(a,13)^rr(a,22),maj=(a&bb)^(a&c)^(bb&c),t2=s0+maj;h=g;g=f;f=e;e=d+t1;d=c;c=bb;bb=a;a=t1+t2;}
  s->h[0]+=a;s->h[1]+=bb;s->h[2]+=c;s->h[3]+=d;s->h[4]+=e;s->h[5]+=f;s->h[6]+=g;s->h[7]+=h;
}
static void sha_init(Sha256*s){uint32_t h[8]={0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19};memcpy(s->h,h,sizeof h);s->bits=0;s->used=0;}
static void sha_add(Sha256*s,const unsigned char*p,size_t n){s->bits+=(uint64_t)n*8;while(n){size_t take=64-s->used;if(take>n)take=n;memcpy(s->block+s->used,p,take);s->used+=take;p+=take;n-=take;if(s->used==64){sha_block(s,s->block);s->used=0;}}}
static void sha_final(Sha256*s,char out[65]){s->block[s->used++]=0x80;if(s->used>56){while(s->used<64)s->block[s->used++]=0;sha_block(s,s->block);s->used=0;}while(s->used<56)s->block[s->used++]=0;for(int i=7;i>=0;i--)s->block[s->used++]=(unsigned char)(s->bits>>(8*i));sha_block(s,s->block);for(int i=0;i<8;i++)snprintf(out+8*i,9,"%08x",s->h[i]);out[64]=0;}
static void digest(const void*p,size_t n,char out[65]){Sha256 s;sha_init(&s);sha_add(&s,p,n);sha_final(&s,out);}

static __attribute__((unused)) int lower_hex(const char *s,size_t n){if(!s||strlen(s)!=n)return 0;for(size_t i=0;i<n;i++)if(!((s[i]>='0'&&s[i]<='9')||(s[i]>='a'&&s[i]<='f')))return 0;return 1;}
static __attribute__((unused)) void random_hex(char *out,size_t bytes){unsigned char raw[32];if(bytes>sizeof raw)_exit(125);arc4random_buf(raw,bytes);for(size_t i=0;i<bytes;i++)snprintf(out+2*i,3,"%02x",raw[i]);out[2*bytes]=0;}
static int same_stat(const struct stat*a,const struct stat*b){return a->st_dev==b->st_dev&&a->st_ino==b->st_ino&&a->st_mode==b->st_mode&&a->st_uid==b->st_uid&&a->st_gid==b->st_gid&&a->st_nlink==b->st_nlink&&a->st_size==b->st_size&&a->st_mtimespec.tv_sec==b->st_mtimespec.tv_sec&&a->st_mtimespec.tv_nsec==b->st_mtimespec.tv_nsec&&a->st_ctimespec.tv_sec==b->st_ctimespec.tv_sec&&a->st_ctimespec.tv_nsec==b->st_ctimespec.tv_nsec;}
static int write_all(int fd,const void *raw,size_t n){const unsigned char*p=raw;while(n){ssize_t q=write(fd,p,n);if(q<0&&errno==EINTR)continue;if(q<=0)return 0;p+=q;n-=(size_t)q;}return 1;}
static int pread_all(int fd,unsigned char *raw,size_t n){size_t at=0;while(at<n){ssize_t q=pread(fd,raw+at,n-at,(off_t)at);if(q<0&&errno==EINTR)continue;if(q<=0)return 0;at+=(size_t)q;}return 1;}
static int stable_read_fd(int fd,size_t maximum,unsigned char **out,size_t *length,struct stat *identity){
  struct stat a,b,c;if(fstat(fd,&a)||!S_ISREG(a.st_mode)||a.st_nlink!=1||a.st_size<0||(uint64_t)a.st_size>maximum)return 0;
  size_t n=(size_t)a.st_size;unsigned char *one=malloc(n?n:1),*two=malloc(n?n:1);if(!one||!two){free(one);free(two);return 0;}
  int ok=pread_all(fd,one,n)&&fstat(fd,&b)==0&&same_stat(&a,&b)&&pread_all(fd,two,n)&&fstat(fd,&c)==0&&same_stat(&b,&c)&&memcmp(one,two,n)==0;
  free(two);if(!ok){free(one);return 0;}*out=one;*length=n;if(identity)*identity=c;return 1;
}
static int stable_named_fd(int dir,const char *name,int flags,uid_t uid,gid_t gid,mode_t mode,size_t maximum,unsigned char **out,size_t *length,struct stat *identity){
  int fd=openat(dir,name,flags|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);if(fd<0)return -1;struct stat before,rebound;int ok=fstat(fd,&before)==0&&S_ISREG(before.st_mode)&&before.st_uid==uid&&(gid==(gid_t)-1||before.st_gid==gid)&&((before.st_mode&07777)==mode)&&before.st_nlink==1;
  if(ok&&out)ok=stable_read_fd(fd,maximum,out,length,identity);else if(ok&&identity)*identity=before;
  if(ok)ok=fstatat(dir,name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0&&same_stat(identity?identity:&before,&rebound);
  if(!ok){close(fd);return -1;}return fd;
}
static int fixed_dir_at(int parent,const char *name,uid_t uid,gid_t gid,mode_t mode){int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s,r;if(fd<0||fstat(fd,&s)||!S_ISDIR(s.st_mode)||s.st_uid!=uid||s.st_gid!=gid||(s.st_mode&07777)!=mode||fstatat(parent,name,&r,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&s,&r)){if(fd>=0)close(fd);return -1;}return fd;}
static int flush_dir(int fd){return fsync(fd)==0;}

typedef struct{const unsigned char*s;size_t n,i;} Parser;
static void ws(Parser*p){while(p->i<p->n&&(p->s[p->i]==' '||p->s[p->i]=='\t'||p->s[p->i]=='\r'||p->s[p->i]=='\n'))p->i++;}
static int take(Parser*p,unsigned char c){ws(p);if(p->i>=p->n||p->s[p->i]!=c)return 0;p->i++;return 1;}
static int utf8(const unsigned char*s,size_t n){size_t i=0;while(i<n){unsigned c=s[i++];if(c<128)continue;unsigned need,min,v;if((c&0xe0)==0xc0){need=1;min=0x80;v=c&31;}else if((c&0xf0)==0xe0){need=2;min=0x800;v=c&15;}else if((c&0xf8)==0xf0){need=3;min=0x10000;v=c&7;}else return 0;if(i+need>n)return 0;for(unsigned j=0;j<need;j++){unsigned d=s[i++];if((d&0xc0)!=0x80)return 0;v=(v<<6)|(d&63);}if(v<min||v>0x10ffff||(v>=0xd800&&v<=0xdfff))return 0;}return 1;}
static int hex4(Parser*p,unsigned*v){unsigned x=0;if(p->i+4>p->n)return 0;for(int i=0;i<4;i++){unsigned c=p->s[p->i++],d;if(c>='0'&&c<='9')d=c-'0';else if(c>='a'&&c<='f')d=c-'a'+10;else if(c>='A'&&c<='F')d=c-'A'+10;else return 0;x=(x<<4)|d;}*v=x;return 1;}
static int put_utf8(char*out,size_t cap,size_t*used,unsigned v){unsigned char b[4];size_t n;if(v<0x80){b[0]=v;n=1;}else if(v<0x800){b[0]=0xc0|(v>>6);b[1]=0x80|(v&63);n=2;}else if(v<0x10000){b[0]=0xe0|(v>>12);b[1]=0x80|((v>>6)&63);b[2]=0x80|(v&63);n=3;}else{b[0]=0xf0|(v>>18);b[1]=0x80|((v>>12)&63);b[2]=0x80|((v>>6)&63);b[3]=0x80|(v&63);n=4;}if(*used+n>=cap)return 0;memcpy(out+*used,b,n);*used+=n;return 1;}
static int string_value(Parser*p,char*out,size_t cap){size_t used=0;ws(p);if(!cap||p->i>=p->n||p->s[p->i++]!='"')return 0;while(p->i<p->n){unsigned c=p->s[p->i++];if(c=='"'){out[used]=0;return 1;}if(c<0x20)return 0;if(c!='\\'){if(used+1>=cap)return 0;out[used++]=(char)c;continue;}if(p->i>=p->n)return 0;c=p->s[p->i++];if(c=='"'||c=='\\'||c=='/'){if(used+1>=cap)return 0;out[used++]=(char)c;}else if(c=='b'||c=='f'||c=='n'||c=='r'||c=='t'){char m=c=='b'?'\b':c=='f'?'\f':c=='n'?'\n':c=='r'?'\r':'\t';if(used+1>=cap)return 0;out[used++]=m;}else if(c=='u'){unsigned v,lo;if(!hex4(p,&v))return 0;if(v>=0xd800&&v<=0xdbff){if(p->i+2>p->n||p->s[p->i++]!='\\'||p->s[p->i++]!='u'||!hex4(p,&lo)||lo<0xdc00||lo>0xdfff)return 0;v=0x10000+((v-0xd800)<<10)+(lo-0xdc00);}else if(v>=0xdc00&&v<=0xdfff)return 0;if(!put_utf8(out,cap,&used,v))return 0;}else return 0;}return 0;}
static int skip_value(Parser*,unsigned);
static int skip_number(Parser*p){ws(p);size_t i=p->i;if(i<p->n&&p->s[i]=='-')i++;if(i>=p->n)return 0;if(p->s[i]=='0')i++;else{if(p->s[i]<'1'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}if(i<p->n&&p->s[i]=='.'){i++;if(i>=p->n||p->s[i]<'0'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}if(i<p->n&&(p->s[i]=='e'||p->s[i]=='E')){i++;if(i<p->n&&(p->s[i]=='+'||p->s[i]=='-'))i++;if(i>=p->n||p->s[i]<'0'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}p->i=i;return 1;}
static int skip_object(Parser*p,unsigned depth){char keys[32][128],key[128],tmp[512];size_t count=0;if(depth>8||!take(p,'{'))return 0;ws(p);if(p->i<p->n&&p->s[p->i]=='}'){p->i++;return 1;}for(;;){if(count==32||!string_value(p,key,sizeof key))return 0;for(size_t j=0;j<count;j++)if(!strcmp(keys[j],key))return 0;strcpy(keys[count++],key);if(!take(p,':')||!skip_value(p,depth+1))return 0;ws(p);if(p->i<p->n&&p->s[p->i]=='}'){p->i++;return 1;}if(!take(p,','))return 0;(void)tmp;}}
static int skip_array(Parser*p,unsigned depth){if(depth>8||!take(p,'['))return 0;ws(p);if(p->i<p->n&&p->s[p->i]==']'){p->i++;return 1;}for(;;){if(!skip_value(p,depth+1))return 0;ws(p);if(p->i<p->n&&p->s[p->i]==']'){p->i++;return 1;}if(!take(p,','))return 0;}}
static int skip_value(Parser*p,unsigned depth){char tmp[1024];ws(p);if(p->i>=p->n)return 0;unsigned c=p->s[p->i];if(c=='"')return string_value(p,tmp,sizeof tmp);if(c=='{')return skip_object(p,depth);if(c=='[')return skip_array(p,depth);if(c=='-'||(c>='0'&&c<='9'))return skip_number(p);for(const char **q=(const char*[]){"true","false","null",NULL};*q;q++){size_t n=strlen(*q);if(p->i+n<=p->n&&!memcmp(p->s+p->i,*q,n)){p->i+=n;return 1;}}return 0;}

typedef struct{char operation[32],nonce[65],capability[65];int schema_one;unsigned keys;int has_operation,has_nonce,has_capability,has_schema;} Request;
static __attribute__((unused)) int parse_request(const unsigned char*raw,size_t n,Request*r){
  if(!utf8(raw,n))return 0;Parser p={raw,n,0};char seen[16][128],key[128];size_t count=0;memset(r,0,sizeof *r);if(!take(&p,'{'))return 0;ws(&p);if(p.i<p.n&&p.s[p.i]=='}')p.i++;else for(;;){if(count==16||!string_value(&p,key,sizeof key))return 0;for(size_t j=0;j<count;j++)if(!strcmp(seen[j],key))return 0;strcpy(seen[count++],key);if(!take(&p,':'))return 0;if(!strcmp(key,"operation")){if(!string_value(&p,r->operation,sizeof r->operation))return 0;r->has_operation=1;}else if(!strcmp(key,"request_nonce")){if(!string_value(&p,r->nonce,sizeof r->nonce))return 0;r->has_nonce=1;}else if(!strcmp(key,"capability")){if(!string_value(&p,r->capability,sizeof r->capability))return 0;r->has_capability=1;}else if(!strcmp(key,"schema_version")){ws(&p);size_t start=p.i;if(!skip_value(&p,1))return 0;r->has_schema=1;r->schema_one=p.i-start==1&&p.s[start]=='1';}else if(!skip_value(&p,1))return 0;ws(&p);if(p.i<p.n&&p.s[p.i]=='}'){p.i++;break;}if(!take(&p,','))return 0;}ws(&p);if(p.i!=p.n)return 0;r->keys=(unsigned)count;return 1;
}

static int recv_piece(int fd,unsigned char*dst,size_t n,int *ancillary){
  size_t at=0;while(at<n){struct iovec iov={dst+at,n-at};unsigned char control[CMSG_SPACE(sizeof(int)*16)]={0};struct msghdr msg={0};msg.msg_iov=&iov;msg.msg_iovlen=1;msg.msg_control=control;msg.msg_controllen=sizeof control;ssize_t q=recvmsg(fd,&msg,0);if(q<0&&errno==EINTR)continue;if(q<=0)return 0;if(msg.msg_flags&(MSG_TRUNC|MSG_CTRUNC))return 0;for(struct cmsghdr*c=CMSG_FIRSTHDR(&msg);c;c=CMSG_NXTHDR(&msg,c)){*ancillary=1;if(c->cmsg_level==SOL_SOCKET&&c->cmsg_type==SCM_RIGHTS){size_t bytes=c->cmsg_len>=CMSG_LEN(0)?c->cmsg_len-CMSG_LEN(0):0;int*fds=(int*)CMSG_DATA(c);for(size_t i=0;i<bytes/sizeof(int);i++)close(fds[i]);}}at+=(size_t)q;}return 1;
}
static __attribute__((unused)) int receive_frame(int fd,unsigned char **out,size_t *length){
  struct timeval tv={5,0};if(setsockopt(fd,SOL_SOCKET,SO_RCVTIMEO,&tv,sizeof tv))return 0;unsigned char prefix[4],extra;int ancillary=0;if(!recv_piece(fd,prefix,4,&ancillary))return 0;uint32_t n=(uint32_t)prefix[0]<<24|(uint32_t)prefix[1]<<16|(uint32_t)prefix[2]<<8|prefix[3];if(n>FRAME_MAX)return 0;unsigned char*raw=malloc(n?n:1);if(!raw)return 0;if(!recv_piece(fd,raw,n,&ancillary)){free(raw);return 0;}struct iovec iov={&extra,1};unsigned char control[CMSG_SPACE(sizeof(int)*16)]={0};struct msghdr msg={0};msg.msg_iov=&iov;msg.msg_iovlen=1;msg.msg_control=control;msg.msg_controllen=sizeof control;ssize_t q;do{q=recvmsg(fd,&msg,0);}while(q<0&&errno==EINTR);for(struct cmsghdr*c=CMSG_FIRSTHDR(&msg);c;c=CMSG_NXTHDR(&msg,c)){ancillary=1;if(c->cmsg_level==SOL_SOCKET&&c->cmsg_type==SCM_RIGHTS){size_t bytes=c->cmsg_len-CMSG_LEN(0);int*fds=(int*)CMSG_DATA(c);for(size_t i=0;i<bytes/sizeof(int);i++)close(fds[i]);}}if(q!=0||msg.msg_flags&(MSG_TRUNC|MSG_CTRUNC)||ancillary){free(raw);return 0;}*out=raw;*length=n;return 1;
}

#if defined(H039_INSTALLER) && !defined(H039_MEDIATOR_SHA256)
#error H039_MEDIATOR_SHA256 must bind the mediator artifact
#endif

#ifndef H039_INSTALLER
typedef struct {
  char phase[16],runtime[33],cap[65],create_nonce[65],cleanup_nonce[65];
  unsigned long long object_dev,object_ino,runtime_dev,runtime_ino,fifo_dev,fifo_ino,portal_dev,portal_ino,socket_dev,socket_ino,sequence;
} State;
typedef struct {
  char runtime[33],cap[65],create_nonce[65],cleanup_nonce[65],effect[65];
  unsigned long long sequence;
} Receipt;
typedef struct {int ns,a,c,q,r,s,lock;} Store;

static int phase_known(const char*p){const char*v[]={"RESERVING","CREATING","PUBLISHING","PREPARING","PREPARED","ACTIVE","QUARANTINING","CLEANING",NULL};for(size_t i=0;v[i];i++)if(!strcmp(p,v[i]))return 1;return 0;}
static int state_preimage(const State*s,char*out,size_t cap){return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%s\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"runtime_dev\":%llu,\"runtime_id\":\"%s\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}",s->cap,s->cleanup_nonce,s->create_nonce,s->fifo_dev,s->fifo_ino,s->object_dev,s->object_ino,s->phase,s->portal_dev,s->portal_ino,s->runtime_dev,s->runtime,s->runtime_ino,s->sequence,s->socket_dev,s->socket_ino);}
static int state_bytes(const State*s,char*out,size_t cap){char pre[4096],sum[65];int n=state_preimage(s,pre,sizeof pre);if(n<=0||(size_t)n>=sizeof pre)return -1;digest(pre,(size_t)n,sum);return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%s\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%s\",\"runtime_dev\":%llu,\"runtime_id\":\"%s\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}",s->cap,s->cleanup_nonce,s->create_nonce,s->fifo_dev,s->fifo_ino,s->object_dev,s->object_ino,s->phase,s->portal_dev,s->portal_ino,sum,s->runtime_dev,s->runtime,s->runtime_ino,s->sequence,s->socket_dev,s->socket_ino);}
static int parse_state_raw(const unsigned char*raw,size_t n,State*s){
  if(n>=4096)return 0;char text[4096],record[65];memcpy(text,raw,n);text[n]=0;memset(s,0,sizeof *s);int used=0,matched;
  matched=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"%64[0-9a-f]\",\"create_request_nonce\":\"%64[0-9a-f]\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%15[A-Z]\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%64[0-9a-f]\",\"runtime_dev\":%llu,\"runtime_id\":\"%32[0-9a-f]\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}%n",s->cap,s->cleanup_nonce,s->create_nonce,&s->fifo_dev,&s->fifo_ino,&s->object_dev,&s->object_ino,s->phase,&s->portal_dev,&s->portal_ino,record,&s->runtime_dev,s->runtime,&s->runtime_ino,&s->sequence,&s->socket_dev,&s->socket_ino,&used);
  if(matched!=17||(size_t)used!=n){memset(s,0,sizeof *s);matched=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"\",\"create_request_nonce\":\"%64[0-9a-f]\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%15[A-Z]\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%64[0-9a-f]\",\"runtime_dev\":%llu,\"runtime_id\":\"%32[0-9a-f]\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}%n",s->cap,s->create_nonce,&s->fifo_dev,&s->fifo_ino,&s->object_dev,&s->object_ino,s->phase,&s->portal_dev,&s->portal_ino,record,&s->runtime_dev,s->runtime,&s->runtime_ino,&s->sequence,&s->socket_dev,&s->socket_ino,&used);if(matched!=16||(size_t)used!=n)return 0;}
  char pre[4096],sum[65],again[4096];int pn=state_preimage(s,pre,sizeof pre),an=state_bytes(s,again,sizeof again);if(pn<=0||an!=(int)n||memcmp(again,raw,n)||!lower_hex(s->cap,64)||!lower_hex(s->runtime,32)||!lower_hex(s->create_nonce,64)||(*s->cleanup_nonce&&!lower_hex(s->cleanup_nonce,64))||!phase_known(s->phase))return 0;digest(pre,(size_t)pn,sum);return !strcmp(sum,record)&&s->sequence>0;
}
static int receipt_preimage(const Receipt*r,char*out,size_t cap){return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1,\"sequence\":%llu,\"zero_runtime_residue\":true}",r->cap,r->cleanup_nonce,r->create_nonce,r->runtime,r->sequence);}
static int receipt_bytes(Receipt*r,char*out,size_t cap){char effect[1024];int en=receipt_preimage(r,effect,sizeof effect);if(en<=0||(size_t)en>=sizeof effect)return -1;digest(effect,(size_t)en,r->effect);return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"effect_sha256\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1,\"sequence\":%llu}",r->cap,r->cleanup_nonce,r->create_nonce,r->effect,r->runtime,r->sequence);}
static int parse_receipt_raw(const unsigned char*raw,size_t n,Receipt*r){if(n>=2048)return 0;char text[2048],again[2048];memcpy(text,raw,n);text[n]=0;memset(r,0,sizeof *r);int used=0,got=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"%64[0-9a-f]\",\"create_request_nonce\":\"%64[0-9a-f]\",\"effect_sha256\":\"%64[0-9a-f]\",\"runtime_id\":\"%32[0-9a-f]\",\"schema_version\":1,\"sequence\":%llu}%n",r->cap,r->cleanup_nonce,r->create_nonce,r->effect,r->runtime,&r->sequence,&used);char saved[65];strcpy(saved,r->effect);int an=receipt_bytes(r,again,sizeof again);return got==6&&(size_t)used==n&&an==(int)n&&!memcmp(again,raw,n)&&!strcmp(saved,r->effect)&&r->sequence>0;}

static int open_store(Store*t){memset(t,-1,sizeof *t);t->ns=open(NS,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s;if(t->ns<0||fstat(t->ns,&s)||!S_ISDIR(s.st_mode)||s.st_uid||s.st_gid||(s.st_mode&07777)!=0555)return 0;t->a=fixed_dir_at(t->ns,"a",0,0,0555);t->c=fixed_dir_at(t->ns,"c",0,0,0555);t->q=fixed_dir_at(t->ns,"q",0,0,0555);t->r=fixed_dir_at(t->ns,"r",0,0,0555);t->s=fixed_dir_at(t->ns,"s",0,0,0555);if(t->a<0||t->c<0||t->q<0||t->r<0||t->s<0)return 0;t->lock=stable_named_fd(t->s,"lock",O_RDWR,0,0,0600,0,NULL,NULL,&s);return t->lock>=0&&s.st_size==0;}
static void close_store(Store*t){int*f=&t->ns;for(size_t i=0;i<7;i++)if(f[i]>=0)close(f[i]);memset(t,-1,sizeof *t);}
static int acquire_lock(int fd){struct flock lk;memset(&lk,0,sizeof lk);lk.l_type=F_WRLCK;lk.l_whence=SEEK_SET;lk.l_start=0;lk.l_len=0;return fcntl(fd,F_OFD_SETLK,&lk)==0;}
static int read_named(int dir,const char*name,unsigned char**raw,size_t*n,struct stat*id){int fd=stable_named_fd(dir,name,O_RDONLY,0,0,0444,4096,raw,n,id);if(fd<0)return 0;close(fd);return 1;}
static int state_present(Store*t,State*s){unsigned char*raw=NULL;size_t n=0;struct stat id;if(!read_named(t->s,"current",&raw,&n,&id))return errno==ENOENT?0:-1;int ok=parse_state_raw(raw,n,s);free(raw);return ok?1:-1;}
static int last_present(Store*t,Receipt*r,unsigned char **bytes,size_t *length){struct stat id;unsigned char*raw=NULL;size_t n=0;if(!read_named(t->r,"last",&raw,&n,&id))return errno==ENOENT?0:-1;int ok=parse_receipt_raw(raw,n,r);if(ok&&bytes)*bytes=raw;else free(raw);if(ok&&length)*length=n;return ok?1:-1;}
static int write_temp(int dir,const char*name,const void*raw,size_t n){int fd=openat(dir,name,O_WRONLY|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0444);if(fd<0)return 0;int ok=write_all(fd,raw,n)&&!fsync(fd)&&!fchown(fd,0,0)&&!fchmod(fd,0444)&&!fsync(fd);struct stat a,b;if(ok)ok=!fstat(fd,&a)&&S_ISREG(a.st_mode)&&a.st_uid==0&&a.st_gid==0&&(a.st_mode&07777)==0444&&a.st_nlink==1&&a.st_size==(off_t)n&&!fstatat(dir,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&a,&b);close(fd);return ok;}
static int publish_temp(int dir,const char*tmp,const char*final,int absent){unsigned flags=RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH|(absent?RENAME_EXCL:0);return renameatx_np(dir,tmp,dir,final,flags)==0&&flush_dir(dir);}
static int put_state(Store*t,const State*s,int absent){char raw[4096];int n=state_bytes(s,raw,sizeof raw);return n>0&&(size_t)n<sizeof raw&&write_temp(t->s,".current.tmp",raw,(size_t)n)&&publish_temp(t->s,".current.tmp","current",absent);}
static int remove_state(Store*t){return unlinkat(t->s,"current",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_UNIQUE)==0&&flush_dir(t->s);}

static int error_frame(int fd,const char*nonce,const char*reason){char body[512];int n=snprintf(body,sizeof body,"{\"operation\":\"error-v1\",\"reason\":\"%s\",\"request_nonce\":\"%s\",\"schema_version\":1}",reason,nonce);if(n<=0||(size_t)n>=sizeof body)return 0;unsigned char prefix[4]={(unsigned char)((unsigned)n>>24),(unsigned char)((unsigned)n>>16),(unsigned char)((unsigned)n>>8),(unsigned char)n};return write_all(fd,prefix,4)&&write_all(fd,body,(size_t)n);}
static int json_frame(int fd,const char*body){size_t n=strlen(body);if(n>FRAME_MAX)return 0;unsigned char prefix[4]={(unsigned char)(n>>24),(unsigned char)(n>>16),(unsigned char)(n>>8),(unsigned char)n};return write_all(fd,prefix,4)&&write_all(fd,body,n);}

static int object_name(const State*s,char out[35]){return snprintf(out,35,"o-%s",s->runtime)==34;}
static int open_exact_dir(int parent,const char*name,uid_t uid,gid_t gid,mode_t mode,unsigned long long dev,unsigned long long ino){int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat a,b;if(fd<0||fstat(fd,&a)||!S_ISDIR(a.st_mode)||a.st_uid!=uid||a.st_gid!=gid||(a.st_mode&07777)!=mode||a.st_nlink<2||(dev&&((unsigned long long)a.st_dev!=dev||(unsigned long long)a.st_ino!=ino))||fstatat(parent,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&a,&b)){if(fd>=0)close(fd);return -1;}return fd;}
static int create_dir_owned(int parent,const char*name,uid_t uid,gid_t gid,mode_t mode){if(mkdirat(parent,name,0700))return -1;int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat a,b;if(fd<0||fchown(fd,uid,gid)||fchmod(fd,mode)||fsync(fd)||fstat(fd,&a)||!S_ISDIR(a.st_mode)||a.st_uid!=uid||a.st_gid!=gid||(a.st_mode&07777)!=mode||fstatat(parent,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&a,&b)){if(fd>=0)close(fd);return -1;}return fd;}
static int hex_bytes(const char*hex,unsigned char*out,size_t n){if(!lower_hex(hex,n*2))return 0;for(size_t i=0;i<n;i++){unsigned a=hex[2*i],b=hex[2*i+1];a=a<='9'?a-'0':a-'a'+10;b=b<='9'?b-'0':b-'a'+10;out[i]=(unsigned char)((a<<4)|b);}return 1;}
static int load_private_python(unsigned char**out,size_t*n){
  if(seteuid(CLIENT_UID))return 0;int fd=open(PYTHON_SOURCE,O_RDONLY|O_CLOEXEC|O_NONBLOCK|O_NOFOLLOW_ANY|O_UNIQUE);struct stat a,b;int ok=fd>=0&&!fstat(fd,&a)&&S_ISREG(a.st_mode)&&a.st_uid==CLIENT_UID&&a.st_gid==80&&(a.st_mode&07777)==0755&&a.st_nlink==1&&a.st_size==33568&&stable_read_fd(fd,33568,out,n,&a)&&!lstat(PYTHON_SOURCE,&b)&&same_stat(&a,&b);if(fd>=0)close(fd);if(seteuid(0))_exit(125);if(!ok)return 0;char sum[65];digest(*out,*n,sum);if(strcmp(sum,PYTHON_SHA256)){free(*out);*out=NULL;return 0;}return 1;
}
static int create_python(int portal,const unsigned char*raw,size_t n,struct stat*identity){int fd=openat(portal,"python",O_WRONLY|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0500);if(fd<0)return 0;int ok=write_all(fd,raw,n)&&!fsync(fd)&&!fchown(fd,0,0)&&!fchmod(fd,0555)&&!fsync(fd);struct stat rebound;if(ok)ok=!fstat(fd,identity)&&S_ISREG(identity->st_mode)&&identity->st_uid==0&&identity->st_gid==0&&(identity->st_mode&07777)==0555&&identity->st_nlink==1&&identity->st_size==(off_t)n&&!fstatat(portal,"python",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(identity,&rebound);close(fd);return ok;}
static int descriptor_path_exact(int fd,const char*wanted){char raw[1024]={0};if(fcntl(fd,F_GETPATH,raw)<0)return 0;return !strcmp(raw,wanted);}
static int listener_identity(int fd,const char*path,struct stat*out){
  struct sockaddr_un address;memset(&address,0,sizeof address);socklen_t n=sizeof address;if(getsockname(fd,(struct sockaddr*)&address,&n)||address.sun_family!=AF_UNIX||strcmp(address.sun_path,path))return 0;
  struct socket_fdinfo info;memset(&info,0,sizeof info);int got=proc_pidfdinfo(getpid(),fd,PROC_PIDFDSOCKETINFO,&info,sizeof info);if(got!=(int)sizeof info||info.psi.soi_family!=AF_UNIX||info.psi.soi_type!=SOCK_STREAM||info.psi.soi_kind!=SOCKINFO_UN||strcmp(info.psi.soi_proto.pri_un.unsi_addr.ua_sun.sun_path,path))return 0;
  struct stat named;if(fstat(fd,out)||!S_ISSOCK(out->st_mode)||lstat(path,&named)||!same_stat(out,&named)||out->st_uid||out->st_gid!=CLIENT_GID||(out->st_mode&07777)!=0620)return 0;return 1;
}
static int bind_listener(const State*s,int portal,struct stat*identity){
  char name[35],path[104];if(!object_name(s,name))return -1;int pn=snprintf(path,sizeof path,NS "/a/%s/p/c",name);if(pn<=0||(size_t)pn>=sizeof path||(size_t)pn>=sizeof(((struct sockaddr_un*)0)->sun_path))return -1;
  int fd=socket(AF_UNIX,SOCK_STREAM,0);if(fd<0)return -1;int one=1;if(fcntl(fd,F_SETFD,FD_CLOEXEC)||setsockopt(fd,SOL_SOCKET,SO_NOSIGPIPE,&one,sizeof one)){close(fd);return -1;}struct sockaddr_un address;memset(&address,0,sizeof address);address.sun_family=AF_UNIX;strcpy(address.sun_path,path);if(bind(fd,(struct sockaddr*)&address,(socklen_t)(offsetof(struct sockaddr_un,sun_path)+strlen(path)+1))||chown(path,0,CLIENT_GID)||chmod(path,0620)||listen(fd,16)||!flush_dir(portal)||!listener_identity(fd,path,identity)){close(fd);return -1;}return fd;
}
static int send_prepared(int fd,const char*body,int runtime,int writer,int listener){
  size_t n=strlen(body);unsigned char prefix[4]={(unsigned char)(n>>24),(unsigned char)(n>>16),(unsigned char)(n>>8),(unsigned char)n};struct iovec iov[2]={{prefix,4},{(void*)body,n}};unsigned char control[CMSG_SPACE(sizeof(int)*3)]={0};struct msghdr msg={0};msg.msg_iov=iov;msg.msg_iovlen=2;msg.msg_control=control;msg.msg_controllen=sizeof control;struct cmsghdr*c=CMSG_FIRSTHDR(&msg);c->cmsg_level=SOL_SOCKET;c->cmsg_type=SCM_RIGHTS;c->cmsg_len=CMSG_LEN(sizeof(int)*3);int fds[3]={runtime,writer,listener};memcpy(CMSG_DATA(c),fds,sizeof fds);msg.msg_controllen=c->cmsg_len;ssize_t sent;do{sent=sendmsg(fd,&msg,0);}while(sent<0&&errno==EINTR);return sent==(ssize_t)(n+4);
}
static int fifo_ack(int reader){struct pollfd p={reader,POLLIN|POLLHUP,0};int q;do{q=poll(&p,1,5000);}while(q<0&&errno==EINTR);if(q<=0)return 0;unsigned char b[2];ssize_t n;do{n=read(reader,b,sizeof b);}while(n<0&&errno==EINTR);if(n!=1||b[0]!='A')return 0;do{n=read(reader,b,1);}while(n<0&&errno==EINTR);return n<0&&(errno==EAGAIN||errno==EWOULDBLOCK);}
static unsigned long long next_sequence(Store*t){Receipt last;int p=last_present(t,&last,NULL,NULL);return p==0?1:p==1?last.sequence+1:0;}

static int create_runtime_object(Store*t,const Request*request){
  State s;memset(&s,0,sizeof s);strcpy(s.phase,"RESERVING");random_hex(s.runtime,16);strcpy(s.create_nonce,request->nonce);char capability[65];random_hex(capability,32);unsigned char capraw[32];if(!hex_bytes(capability,capraw,32))return 0;digest(capraw,sizeof capraw,s.cap);s.sequence=next_sequence(t);if(!s.sequence||!put_state(t,&s,1))return 0;
  char name[35];if(!object_name(&s,name))return 0;int object=create_dir_owned(t->c,name,0,0,0700);if(object<0)return 0;struct stat object_stat;if(fstat(object,&object_stat)){close(object);return 0;}s.object_dev=(unsigned long long)object_stat.st_dev;s.object_ino=(unsigned long long)object_stat.st_ino;strcpy(s.phase,"CREATING");if(!put_state(t,&s,0)){close(object);return 0;}
  int hidden=-1,runtime=-1,reader=-1,writer=-1,portal=-1,listener=-1;unsigned char*python=NULL;size_t python_n=0;int ok=0;struct stat runtime_stat,fifo_stat,portal_stat,socket_stat,python_stat;
  hidden=create_dir_owned(object,"h",0,0,0700);if(hidden<0)goto done;runtime=create_dir_owned(hidden,"r",CLIENT_UID,CLIENT_GID,0700);if(runtime<0||mkfifoat(hidden,"l",0600))goto done;reader=openat(hidden,"l",O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);writer=openat(hidden,"l",O_WRONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);if(reader<0||writer<0||fstat(runtime,&runtime_stat)||fstat(writer,&fifo_stat)||!S_ISFIFO(fifo_stat.st_mode)||fifo_stat.st_uid||fifo_stat.st_gid||(fifo_stat.st_mode&07777)!=0600||fifo_stat.st_nlink!=1)goto done;
  portal=create_dir_owned(object,"p",0,CLIENT_GID,0700);if(portal<0||!load_private_python(&python,&python_n)||!create_python(portal,python,python_n,&python_stat)||fchmod(portal,0550)||fsync(portal)||fchmod(object,0555)||fsync(object)||fstat(portal,&portal_stat))goto done;
  s.runtime_dev=(unsigned long long)runtime_stat.st_dev;s.runtime_ino=(unsigned long long)runtime_stat.st_ino;s.fifo_dev=(unsigned long long)fifo_stat.st_dev;s.fifo_ino=(unsigned long long)fifo_stat.st_ino;s.portal_dev=(unsigned long long)portal_stat.st_dev;s.portal_ino=(unsigned long long)portal_stat.st_ino;strcpy(s.phase,"PUBLISHING");if(!put_state(t,&s,0)||renameatx_np(t->c,name,t->a,name,RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH)||!flush_dir(t->c)||!flush_dir(t->a))goto done;
  strcpy(s.phase,"PREPARING");if(!put_state(t,&s,0))goto done;listener=bind_listener(&s,portal,&socket_stat);if(listener<0)goto done;s.socket_dev=(unsigned long long)socket_stat.st_dev;s.socket_ino=(unsigned long long)socket_stat.st_ino;strcpy(s.phase,"PREPARED");if(!put_state(t,&s,0))goto done;
  char runtime_path[256],fifo_path[256],body[1024];snprintf(runtime_path,sizeof runtime_path,NS "/a/%s/h/r",name);snprintf(fifo_path,sizeof fifo_path,NS "/a/%s/h/l",name);if(!descriptor_path_exact(runtime,runtime_path)||!descriptor_path_exact(writer,fifo_path))goto done;int bn=snprintf(body,sizeof body,"{\"capability\":\"%s\",\"operation\":\"create-prepared-v1\",\"portal_identity\":\"%s/a/%s/p\",\"request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1}",capability,NS,name,request->nonce,s.runtime);if(bn<=0||(size_t)bn>=sizeof body||!send_prepared(0,body,runtime,writer,listener))goto done;
  if(!fifo_ack(reader)){error_frame(0,request->nonce,"INVALID_ACK");goto done;}strcpy(s.phase,"ACTIVE");if(!put_state(t,&s,0))goto done;char committed[512];snprintf(committed,sizeof committed,"{\"operation\":\"create-committed-v1\",\"request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1}",request->nonce,s.runtime);if(!json_frame(0,committed))goto done;ok=1;
done:free(python);if(listener>=0)close(listener);if(portal>=0)close(portal);if(writer>=0)close(writer);if(reader>=0)close(reader);if(runtime>=0)close(runtime);if(hidden>=0)close(hidden);close(object);return ok;
}

typedef struct{unsigned count,depth;unsigned long long bytes;const char*reason;} Clean;
static const char *delete_reason(int error){if(error==EBUSY)return "INCOMPLETE_BUSY";if(error==ENOTCAPABLE||error==EMLINK)return "INCOMPLETE_UNIQUE";if(error==EINVAL||error==ENOTSUP||error==EOPNOTSUPP)return "UNSUPPORTED_PRIMITIVE";return "INCOMPLETE_IDENTITY";}
static int clean_contents(int dir,dev_t device,unsigned depth,Clean*c){
  if(depth>TREE_DEPTH_MAX){c->reason="INCOMPLETE_IDENTITY";return 0;}int scanfd=dup(dir);if(scanfd<0)return 0;DIR*d=fdopendir(scanfd);if(!d){close(scanfd);return 0;}struct dirent*e;int ok=1;
  while(ok&&(e=readdir(d))!=NULL){if(!strcmp(e->d_name,".")||!strcmp(e->d_name,".."))continue;size_t name_n=strlen(e->d_name);if(!name_n||name_n>255||strchr(e->d_name,'/')){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}if(++c->count>TREE_FILES_MAX){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}struct stat st;if(fstatat(dir,e->d_name,&st,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||st.st_dev!=device){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}
    if(S_ISDIR(st.st_mode)){int child=openat(dir,e->d_name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat opened,rebound;if(child<0||fstat(child,&opened)||!same_stat(&st,&opened)||fstatat(dir,e->d_name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&opened,&rebound)){if(child>=0)close(child);c->reason="INCOMPLETE_IDENTITY";ok=0;break;}if(!clean_contents(child,device,depth+1,c)){close(child);ok=0;break;}close(child);if(unlinkat(dir,e->d_name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY)){c->reason=delete_reason(errno);ok=0;break;}}
    else if(S_ISREG(st.st_mode)||S_ISLNK(st.st_mode)||S_ISFIFO(st.st_mode)||S_ISSOCK(st.st_mode)){if(S_ISREG(st.st_mode)){if(st.st_size<0||(c->bytes+=(unsigned long long)st.st_size)>TREE_BYTES_MAX){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}}if(unlinkat(dir,e->d_name,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE)){c->reason=delete_reason(errno);ok=0;break;}}
    else{c->reason="INCOMPLETE_IDENTITY";ok=0;break;}
  }
  closedir(d);return ok;
}
static int locate_object(Store*t,const State*s,int *parent,char name[35]){
  if(!object_name(s,name))return -1;int candidates[3]={t->c,t->a,t->q},found=-1,count=0;for(int i=0;i<3;i++){struct stat st;if(fstatat(candidates[i],name,&st,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISDIR(st.st_mode)||(s->object_dev&&((unsigned long long)st.st_dev!=s->object_dev||(unsigned long long)st.st_ino!=s->object_ino)))return -1;found=candidates[i];count++;}else if(errno!=ENOENT)return -1;}if(count>1)return -1;*parent=found;return count;
}
static int fifo_eof_for(Store*t,const State*s,int *reader,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(located!=1){*reason="INCOMPLETE_IDENTITY";return -1;}int object=open_exact_dir(parent,name,0,0,(!strcmp(s->phase,"RESERVING")||!strcmp(s->phase,"CREATING"))?0700:0555,s->object_dev,s->object_ino);int hidden=object<0?-1:open_exact_dir(object,"h",0,0,0700,0,0);if(object<0||hidden<0){if(hidden>=0)close(hidden);if(object>=0)close(object);*reason="INCOMPLETE_IDENTITY";return -1;}int fd=openat(hidden,"l",O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);struct stat st;close(hidden);close(object);if(fd<0){if(!strcmp(s->phase,"CLEANING")&&errno==ENOENT){*reader=-1;return 1;}*reason="INCOMPLETE_IDENTITY";return -1;}if(fstat(fd,&st)||!S_ISFIFO(st.st_mode)||(unsigned long long)st.st_dev!=s->fifo_dev||(unsigned long long)st.st_ino!=s->fifo_ino||st.st_uid||st.st_gid||(st.st_mode&07777)!=0600||st.st_nlink!=1){close(fd);*reason="INCOMPLETE_IDENTITY";return -1;}unsigned char bytes[2];ssize_t n;do{n=read(fd,bytes,sizeof bytes);}while(n<0&&errno==EINTR);if(n<0&&(errno==EAGAIN||errno==EWOULDBLOCK)){close(fd);return 0;}if(n!=0){close(fd);*reason="INCOMPLETE_IDENTITY";return -1;}*reader=fd;return 1;
}
static int quarantine(Store*t,State*s,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(located!=1){*reason="INCOMPLETE_IDENTITY";return 0;}
  if(!strcmp(s->phase,"ACTIVE")){strcpy(s->phase,"QUARANTINING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}parent=t->a;}
  if(!strcmp(s->phase,"PUBLISHING")&&parent==t->c){if(renameatx_np(t->c,name,t->a,name,RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH)||!flush_dir(t->c)||!flush_dir(t->a)){*reason=delete_reason(errno);return 0;}parent=t->a;strcpy(s->phase,"PREPARING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}}
  if(!strcmp(s->phase,"PUBLISHING")&&parent==t->a){strcpy(s->phase,"PREPARING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}}
  if((!strcmp(s->phase,"QUARANTINING")||!strcmp(s->phase,"PREPARING")||!strcmp(s->phase,"PREPARED")||!strcmp(s->phase,"ACTIVE"))&&parent==t->a){if(strcmp(s->phase,"QUARANTINING")){strcpy(s->phase,"QUARANTINING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}}if(renameatx_np(t->a,name,t->q,name,RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH)||!flush_dir(t->a)||!flush_dir(t->q)){*reason=delete_reason(errno);return 0;}parent=t->q;}
  if(parent!=t->q){*reason="INCOMPLETE_IDENTITY";return 0;}strcpy(s->phase,"CLEANING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}return 1;
}
static int remove_registered_object(Store*t,State*s,int *lease_reader,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(located==0&&(!strcmp(s->phase,"CLEANING"))){return 1;}if(located!=1||parent!=t->q){*reason="INCOMPLETE_IDENTITY";return 0;}int object=open_exact_dir(t->q,name,0,0,0555,s->object_dev,s->object_ino);if(object<0){*reason="INCOMPLETE_IDENTITY";return 0;}int hidden=open_exact_dir(object,"h",0,0,0700,0,0);if(hidden<0){close(object);*reason="INCOMPLETE_IDENTITY";return 0;}int runtime=open_exact_dir(hidden,"r",CLIENT_UID,CLIENT_GID,0700,s->runtime_dev,s->runtime_ino);if(runtime<0){close(hidden);close(object);*reason="INCOMPLETE_IDENTITY";return 0;}struct stat rootst;if(fstat(runtime,&rootst)){close(runtime);close(hidden);close(object);return 0;}Clean clean={0,0,0,"INCOMPLETE_IDENTITY"};int ok=clean_contents(runtime,rootst.st_dev,0,&clean);close(runtime);if(ok&&unlinkat(hidden,"r",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);
  if(ok){if(*lease_reader>=0){close(*lease_reader);*lease_reader=-1;}struct stat fifo;if(fstatat(hidden,"l",&fifo,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISFIFO(fifo.st_mode)||(unsigned long long)fifo.st_dev!=s->fifo_dev||(unsigned long long)fifo.st_ino!=s->fifo_ino)ok=0,clean.reason="INCOMPLETE_IDENTITY";else if(unlinkat(hidden,"l",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);}else if(errno!=ENOENT)ok=0,clean.reason="INCOMPLETE_IDENTITY";}
  close(hidden);if(ok&&unlinkat(object,"h",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);
  int portal=ok?open_exact_dir(object,"p",0,CLIENT_GID,0550,s->portal_dev,s->portal_ino):-1;if(ok&&portal<0)ok=0,clean.reason="INCOMPLETE_IDENTITY";if(ok){struct stat socket_named;if(fstatat(portal,"c",&socket_named,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISSOCK(socket_named.st_mode)||(s->socket_dev&&((unsigned long long)socket_named.st_dev!=s->socket_dev||(unsigned long long)socket_named.st_ino!=s->socket_ino)))ok=0,clean.reason="INCOMPLETE_IDENTITY";else if(unlinkat(portal,"c",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);}else if(errno!=ENOENT)ok=0,clean.reason="INCOMPLETE_IDENTITY";}
  if(ok&&unlinkat(portal,"python",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);if(portal>=0)close(portal);if(ok&&unlinkat(object,"p",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);close(object);if(ok&&unlinkat(t->q,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);if(ok&&!flush_dir(t->q))ok=0,clean.reason="INCOMPLETE_IDENTITY";if(!ok)*reason=clean.reason;return ok;
}
static int publish_receipt(Store*t,const State*s,char digest_out[65]){
  Receipt receipt;memset(&receipt,0,sizeof receipt);strcpy(receipt.runtime,s->runtime);strcpy(receipt.cap,s->cap);strcpy(receipt.create_nonce,s->create_nonce);strcpy(receipt.cleanup_nonce,s->cleanup_nonce);receipt.sequence=s->sequence;char raw[2048];int n=receipt_bytes(&receipt,raw,sizeof raw);if(n<=0||(size_t)n>=sizeof raw)return 0;
  struct stat pending;if(fstatat(t->r,".last.tmp",&pending,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)){if(errno!=ENOENT||!write_temp(t->r,".last.tmp",raw,(size_t)n)||!flush_dir(t->r))return 0;}else{unsigned char*existing=NULL;size_t existing_n=0;struct stat id;if(!read_named(t->r,".last.tmp",&existing,&existing_n,&id)||existing_n!=(size_t)n||memcmp(existing,raw,(size_t)n)){free(existing);return 0;}free(existing);}
  if(!remove_state(t))return 0;int last=fstatat(t->r,"last",&pending,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0;if(!last&&errno!=ENOENT)return 0;if(!publish_temp(t->r,".last.tmp","last",!last))return 0;digest(raw,(size_t)n,digest_out);return 1;
}
static int finish_cleanup(Store*t,State*s,int *lease_reader,const char **reason,char receipt_sha[65]){if(!remove_registered_object(t,s,lease_reader,reason))return 0;return publish_receipt(t,s,receipt_sha);}

static int remove_prepublication(Store*t,State*s,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(!strcmp(s->phase,"RESERVING")){if(located==1){int fd=open_exact_dir(t->c,name,0,0,0700,0,0);if(fd<0){*reason="INCOMPLETE_IDENTITY";return 0;}DIR*d=fdopendir(dup(fd));struct dirent*e;int empty=1;while(d&&(e=readdir(d)))if(strcmp(e->d_name,".")&&strcmp(e->d_name,".."))empty=0;if(d)closedir(d);close(fd);if(!empty||unlinkat(t->c,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY)){*reason=delete_reason(errno);return 0;}}else if(located<0){*reason="INCOMPLETE_IDENTITY";return 0;}return remove_state(t);}
  if(strcmp(s->phase,"CREATING")||located!=1||parent!=t->c){*reason="INCOMPLETE_IDENTITY";return 0;}int object=open_exact_dir(t->c,name,0,0,0700,s->object_dev,s->object_ino);if(object<0){*reason="INCOMPLETE_IDENTITY";return 0;}struct stat st;if(fstat(object,&st)){close(object);return 0;}Clean clean={0,0,0,"INCOMPLETE_IDENTITY"};int ok=clean_contents(object,st.st_dev,0,&clean);close(object);if(ok&&unlinkat(t->c,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);if(ok)ok=flush_dir(t->c)&&remove_state(t);if(!ok)*reason=clean.reason;return ok;
}

static int state_tx_equal(const State*a,const State*b){return !strcmp(a->runtime,b->runtime)&&!strcmp(a->cap,b->cap)&&!strcmp(a->create_nonce,b->create_nonce)&&a->sequence==b->sequence&&a->object_dev==b->object_dev&&a->object_ino==b->object_ino;}
static int phase_index(const char*p){const char*v[]={"RESERVING","CREATING","PUBLISHING","PREPARING","PREPARED","ACTIVE","QUARANTINING","CLEANING"};for(int i=0;i<8;i++)if(!strcmp(p,v[i]))return i;return -1;}
static int reconcile_state_temp(Store*t){
  unsigned char*tmp=NULL,*cur=NULL;size_t tn=0,cn=0;struct stat id;int has_tmp=read_named(t->s,".current.tmp",&tmp,&tn,&id);if(!has_tmp)return errno==ENOENT;State next,old;if(!parse_state_raw(tmp,tn,&next)){free(tmp);return 0;}free(tmp);int has_cur=read_named(t->s,"current",&cur,&cn,&id);if(!has_cur){if(errno!=ENOENT||strcmp(next.phase,"RESERVING"))return 0;return publish_temp(t->s,".current.tmp","current",1);}int ok=parse_state_raw(cur,cn,&old);free(cur);if(!ok||!state_tx_equal(&old,&next))return 0;int a=phase_index(old.phase),b=phase_index(next.phase);if(!((b==a)||(b==a+1)||(a==5&&b==6)||(a==6&&b==7)))return 0;return publish_temp(t->s,".current.tmp","current",0);
}
static int nonce_replayed(Store*t,const State*current,const char*nonce){if(current&&(!strcmp(nonce,current->create_nonce)||(*current->cleanup_nonce&&!strcmp(nonce,current->cleanup_nonce))))return 1;Receipt last;int p=last_present(t,&last,NULL,NULL);return p<0?-1:p==1&&(!strcmp(nonce,last.create_nonce)||!strcmp(nonce,last.cleanup_nonce));}
static int current_capability(const State*s,const char*capability){unsigned char raw[32];char sum[65];if(!hex_bytes(capability,raw,sizeof raw))return 0;digest(raw,sizeof raw,sum);return !strcmp(sum,s->cap);}

static int recover_with_create(Store*t,State*s,const Request*r,const char **reason){
  if(!strcmp(s->phase,"RESERVING")||!strcmp(s->phase,"CREATING")){if(!remove_prepublication(t,s,reason))return 0;*reason="RECOVERED_RETRY";return 1;}
  int reader=-1,eof=fifo_eof_for(t,s,&reader,reason);if(eof==0){*reason="CAPACITY";return 1;}if(eof<0)return 0;strcpy(s->cleanup_nonce,r->nonce);if(!strcmp(s->phase,"CLEANING")){if(!put_state(t,s,0)){close(reader);*reason="INCOMPLETE_IDENTITY";return 0;}}else if(!quarantine(t,s,reason)){if(reader>=0)close(reader);return 0;}char receipt[65];int ok=finish_cleanup(t,s,&reader,reason,receipt);if(reader>=0)close(reader);if(ok)*reason="RECOVERED_RETRY";return ok;
}
static int process_create(Store*t,const Request*r){
  State current;int present=state_present(t,&current);if(present<0)return 1;int replay=nonce_replayed(t,present?&current:NULL,r->nonce);if(replay<0)return 1;if(replay)return error_frame(0,r->nonce,"REPLAY")?1:1;
  if(present){const char*reason="INCOMPLETE_IDENTITY";int recovered=recover_with_create(t,&current,r,&reason);error_frame(0,r->nonce,recovered?reason:reason);return 1;}
  return create_runtime_object(t,r)?0:1;
}
static int process_cleanup(Store*t,const Request*r){
  State current;int present=state_present(t,&current);if(present<0)return 1;int replay=nonce_replayed(t,present?&current:NULL,r->nonce);if(replay<0)return 1;if(replay){error_frame(0,r->nonce,"REPLAY");return 1;}if(!present||!current_capability(&current,r->capability)){error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}if(strcmp(current.phase,"ACTIVE")&&strcmp(current.phase,"QUARANTINING")&&strcmp(current.phase,"CLEANING")){error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}
  const char*reason="INCOMPLETE_IDENTITY";int reader=-1,eof=fifo_eof_for(t,&current,&reader,&reason);if(eof==0){error_frame(0,r->nonce,"LEASE_LIVE");return 1;}if(eof<0){error_frame(0,r->nonce,reason);return 1;}strcpy(current.cleanup_nonce,r->nonce);if(!strcmp(current.phase,"CLEANING")){if(!put_state(t,&current,0)){if(reader>=0)close(reader);error_frame(0,r->nonce,"INCOMPLETE_IDENTITY");return 1;}}else if(!quarantine(t,&current,&reason)){if(reader>=0)close(reader);error_frame(0,r->nonce,reason);return 1;}
  char receipt[65];if(!finish_cleanup(t,&current,&reader,&reason,receipt)){if(reader>=0)close(reader);error_frame(0,r->nonce,reason);return 1;}if(reader>=0)close(reader);char body[512];snprintf(body,sizeof body,"{\"operation\":\"cleanup-result-v1\",\"receipt_sha256\":\"%s\",\"request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1}",receipt,r->nonce,current.runtime);return json_frame(0,body)?0:1;
}
static int request_semantics(const Request*r,const char**reason){
  if(!r->has_nonce||!lower_hex(r->nonce,64))return 0;if(!r->has_operation){*reason="INVALID_OPERATION";return -1;}if(strcmp(r->operation,"create-v1")&&strcmp(r->operation,"cleanup-v1")){*reason="INVALID_OPERATION";return -1;}
  if(!strcmp(r->operation,"create-v1")){if(r->keys!=3||!r->has_nonce||!r->has_schema||!r->schema_one||r->has_capability){*reason="INVALID_KEYS";return -1;}return 1;}
  if(r->keys!=4||!r->has_nonce||!r->has_schema||!r->schema_one||!r->has_capability){*reason="INVALID_KEYS";return -1;}if(!lower_hex(r->capability,64)){*reason="INVALID_CAPABILITY";return -1;}return 2;
}
static int mediator_boundary(void){
  if(getuid()!=CLIENT_UID||getgid()!=CLIENT_GID||geteuid()!=0||getegid()!=CLIENT_GID)return 0;struct stat s;if(fstat(0,&s)||!S_ISSOCK(s.st_mode))return 0;int type=0;socklen_t tn=sizeof type;if(getsockopt(0,SOL_SOCKET,SO_TYPE,&type,&tn)||type!=SOCK_STREAM)return 0;struct sockaddr_un peer;socklen_t pn=sizeof peer;if(getpeername(0,(struct sockaddr*)&peer,&pn)||peer.sun_family!=AF_UNIX)return 0;uid_t uid=(uid_t)-1;gid_t gid=(gid_t)-1;if(getpeereid(0,&uid,&gid)||uid!=CLIENT_UID||gid!=CLIENT_GID)return 0;int one=1;return setsockopt(0,SOL_SOCKET,SO_NOSIGPIPE,&one,sizeof one)==0;
}
static int close_inherited(void){struct rlimit limit;if(getrlimit(RLIMIT_NOFILE,&limit))return 0;rlim_t top=limit.rlim_cur;if(top==RLIM_INFINITY||top>1048576)top=1048576;for(int fd=1;(rlim_t)fd<top;fd++)close(fd);return 1;}
static int mediator_main(int argc,char **argv){
  if(argc!=1||!argv||!argv[0]||!mediator_boundary())return 1;static char*empty[]={NULL};environ=empty;if(chdir("/")||!close_inherited())return 1;umask(077);unsigned char*raw=NULL;size_t n=0;if(!receive_frame(0,&raw,&n))return 1;Request request;int parsed=parse_request(raw,n,&request);free(raw);if(!parsed)return 1;const char*semantic_reason="INVALID_KEYS";int operation=request_semantics(&request,&semantic_reason);if(!operation)return 1;if(operation<0){error_frame(0,request.nonce,semantic_reason);return 1;}
  Store store;if(!open_store(&store)){close_store(&store);return 1;}if(!acquire_lock(store.lock)){int saved=errno;error_frame(0,request.nonce,(saved==EAGAIN||saved==EACCES)?"LOCK_BUSY":"UNSUPPORTED_PRIMITIVE");close_store(&store);return 1;}if(!reconcile_state_temp(&store)){close_store(&store);return 1;}int rc=operation==1?process_create(&store,&request):process_cleanup(&store,&request);close_store(&store);return rc;
}
#endif

#ifdef H039_INSTALLER
#define Q1(x) #x
#define Q(x) Q1(x)

static int canonical_absolute(const char *p){
  if(!p||p[0]!='/'||!p[1]||p[strlen(p)-1]=='/')return 0;
  return strstr(p,"//")==NULL&&strstr(p,"/./")==NULL&&strstr(p,"/../")==NULL&&strcmp(p+strlen(p)-2,"/.")&&strcmp(p+strlen(p)-3,"/..");
}
static int loaded_self(char path[4096],struct stat *identity,int *parent_fd){
  uint32_t cap=4096;if(_NSGetExecutablePath(path,&cap)||!canonical_absolute(path))return 0;
  char copy[4096];if(strlen(path)>=sizeof copy)return 0;strcpy(copy,path);char*slash=strrchr(copy,'/');if(!slash||strcmp(slash+1,"install"))return 0;*slash=0;
  int parent=open(copy,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);if(parent<0)return 0;
  int self=openat(parent,"install",O_RDONLY|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);struct stat a,b;if(self<0||fstat(self,&a)||fstatat(parent,"install",&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&a,&b)||!S_ISREG(a.st_mode)||a.st_nlink!=1){if(self>=0)close(self);close(parent);return 0;}
  struct proc_regionwithpathinfo image={0};int got=proc_pidinfo(getpid(),PROC_PIDREGIONPATHINFO,(uint64_t)(uintptr_t)&main,&image,sizeof image);
  int ok=got==(int)sizeof image&&image.prp_vip.vip_vi.vi_stat.vst_dev==(uint32_t)a.st_dev&&image.prp_vip.vip_vi.vi_stat.vst_ino==(uint64_t)a.st_ino&&strcmp(image.prp_vip.vip_path,path)==0;
  close(self);if(!ok){close(parent);return 0;}*identity=a;*parent_fd=parent;return 1;
}
static int parent_dir(int child,uid_t uid,gid_t gid,mode_t mode){int fd=openat(child,"..",O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s;if(fd<0||fstat(fd,&s)||!S_ISDIR(s.st_mode)||s.st_uid!=uid||(gid!=(gid_t)-1&&s.st_gid!=gid)||(s.st_mode&07777)!=mode){if(fd>=0)close(fd);return -1;}return fd;}
static int open_source(int project,uid_t uid,gid_t gid,mode_t mode,dev_t device,unsigned char **raw,size_t *length,struct stat *identity){
  int fd=stable_named_fd(project,"verify/h039/runtime-cleanup-mediator",O_RDONLY,uid,gid,mode,4194304,raw,length,identity);if(fd<0||identity->st_dev!=device||!*length){if(fd>=0)close(fd);return -1;}char sum[65];digest(*raw,*length,sum);if(strcmp(sum,Q(H039_MEDIATOR_SHA256))){close(fd);free(*raw);*raw=NULL;return -1;}return fd;
}
static int make_dir(int parent,const char *name,mode_t mode){if(mkdirat(parent,name,0700))return 0;int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s,r;int ok=fd>=0&&!fchown(fd,0,0)&&!fchmod(fd,mode)&&!fsync(fd)&&!fstat(fd,&s)&&S_ISDIR(s.st_mode)&&s.st_uid==0&&s.st_gid==0&&(s.st_mode&07777)==mode&&!fstatat(parent,name,&r,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&s,&r);if(fd>=0)close(fd);return ok;}
static int copy_exclusive(int parent,const char *name,const unsigned char *raw,size_t n,mode_t mode){
  int fd=openat(parent,name,O_WRONLY|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0500);if(fd<0)return 0;int ok=write_all(fd,raw,n)&&!fsync(fd)&&!fchown(fd,0,0)&&!fchmod(fd,mode)&&!fsync(fd);struct stat a,b;if(ok)ok=!fstat(fd,&a)&&S_ISREG(a.st_mode)&&a.st_uid==0&&a.st_gid==0&&(a.st_mode&07777)==mode&&a.st_nlink==1&&a.st_size==(off_t)n&&!fstatat(parent,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&a,&b);close(fd);return ok;
}
static int remove_fixed_staging(int project){
  unsigned f=AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_UNIQUE;
  if(unlinkat(project,"verify/h039/runtime-cleanup-mediator",f)||unlinkat(project,"verify/h039",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||unlinkat(project,"verify",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||unlinkat(project,"controller/runtime-cleanup/install",f)||unlinkat(project,"controller/runtime-cleanup",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||unlinkat(project,"controller",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!flush_dir(project))return 0;
  return 1;
}
static int apply_install(int project,const unsigned char *mediator,size_t mediator_n){
  int ns=open(NS,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat nss;if(ns<0||fstat(ns,&nss)||!S_ISDIR(nss.st_mode)||nss.st_uid||nss.st_gid||(nss.st_mode&07777)!=0700){if(ns>=0)close(ns);return 0;}
  const char *dirs[]={"a","c","q","r","s"};for(size_t i=0;i<5;i++)if(!make_dir(ns,dirs[i],0555)){close(ns);return 0;}
  int s=fixed_dir_at(ns,"s",0,0,0555);if(s<0){close(ns);return 0;}int lock=openat(s,"lock",O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0600);struct stat ls;int ok=lock>=0&&!fchown(lock,0,0)&&!fchmod(lock,0600)&&!fsync(lock)&&!fstat(lock,&ls)&&S_ISREG(ls.st_mode)&&ls.st_uid==0&&ls.st_gid==0&&(ls.st_mode&07777)==0600&&ls.st_nlink==1&&ls.st_size==0&&flush_dir(s);if(lock>=0)close(lock);close(s);if(!ok){close(ns);return 0;}
  int helpers=open("/Library/PrivilegedHelperTools",O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat hs;if(helpers<0||fstat(helpers,&hs)||!S_ISDIR(hs.st_mode)||hs.st_uid||hs.st_gid||(hs.st_mode&0022)){if(helpers>=0)close(helpers);close(ns);return 0;}
  ok=copy_exclusive(helpers,"se.nortropic.runtime-cleanup-mediator",mediator,mediator_n,04555)&&flush_dir(helpers);close(helpers);if(!ok){close(ns);return 0;}
  if(!remove_fixed_staging(project)||unlinkat(ns,".install",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||fchmod(ns,0555)||!fsync(ns)){close(ns);return 0;}close(ns);return 1;
}
static int installer_main(int argc,char **argv){
  if(argc!=2||(!argv)||(!argv[0])||(strcmp(argv[1],"verify")&&strcmp(argv[1],"apply")))return 1;int applying=!strcmp(argv[1],"apply");char self_path[4096];struct stat self,source;int self_parent=-1,controller=-1,project=-1,source_fd=-1;unsigned char*raw=NULL;size_t raw_n=0;int result=1;
  if(!loaded_self(self_path,&self,&self_parent)||strcmp(argv[0],self_path))goto done;
  uid_t uid=applying?0:getuid();gid_t gid=applying?0:(gid_t)-1;mode_t self_mode=applying?0500:0755,source_mode=applying?0400:0555;if(self.st_uid!=uid||(applying&&self.st_gid!=gid)||(self.st_mode&07777)!=self_mode||self.st_nlink!=1)goto done;
  controller=parent_dir(self_parent,uid,gid,applying?0700:0755);if(controller<0)goto done;project=parent_dir(controller,uid,gid,0700);if(project<0)goto done;
  if(applying&&strcmp(self_path,NS "/.install/controller/runtime-cleanup/install"))goto done;
  source_fd=open_source(project,uid,gid,source_mode,self.st_dev,&raw,&raw_n,&source);if(source_fd<0)goto done;close(source_fd);source_fd=-1;
  result=applying?!apply_install(project,raw,raw_n):0;
done:if(source_fd>=0)close(source_fd);if(project>=0)close(project);if(controller>=0)close(controller);if(self_parent>=0)close(self_parent);free(raw);return result;
}
#endif

int main(int argc,char **argv){
#ifdef H039_INSTALLER
  return installer_main(argc,argv);
#else
  return mediator_main(argc,argv);
#endif
}
