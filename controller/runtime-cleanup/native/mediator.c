#define _DARWIN_C_SOURCE 1
#include <arpa/inet.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <libproc.h>
#include <limits.h>
#include <mach-o/dyld.h>
#ifdef H039_INSTALLER
#include <mach-o/getsect.h>
#include <mach-o/ldsyms.h>
#endif
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
#include <time.h>
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
  unsigned char extra;ssize_t eof_one,eof_two;do{eof_one=pread(fd,&extra,1,(off_t)n);}while(eof_one<0&&errno==EINTR);
  int ok=pread_all(fd,one,n)&&eof_one==0&&fstat(fd,&b)==0&&same_stat(&a,&b)&&pread_all(fd,two,n);do{eof_two=pread(fd,&extra,1,(off_t)n);}while(eof_two<0&&errno==EINTR);ok=ok&&eof_two==0&&fstat(fd,&c)==0&&same_stat(&b,&c)&&memcmp(one,two,n)==0;
  free(two);if(!ok){free(one);return 0;}*out=one;*length=n;if(identity)*identity=c;return 1;
}
static int stable_named_fd(int dir,const char *name,int flags,uid_t uid,gid_t gid,mode_t mode,size_t maximum,unsigned char **out,size_t *length,struct stat *identity){
  int fd=openat(dir,name,flags|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);if(fd<0)return -1;struct stat before,rebound;int ok=fstat(fd,&before)==0&&S_ISREG(before.st_mode)&&before.st_uid==uid&&(gid==(gid_t)-1||before.st_gid==gid)&&((before.st_mode&07777)==mode)&&before.st_nlink==1;
  if(ok&&out)ok=stable_read_fd(fd,maximum,out,length,identity);else if(ok&&identity)*identity=before;
  if(ok)ok=fstatat(dir,name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0&&same_stat(identity?identity:&before,&rebound);
  if(!ok){close(fd);errno=EINVAL;return -1;}return fd;
}
static int fixed_dir_at(int parent,const char *name,uid_t uid,gid_t gid,mode_t mode){int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s,r;if(fd<0)return -1;if(fstat(fd,&s)||!S_ISDIR(s.st_mode)||s.st_uid!=uid||(gid!=(gid_t)-1&&s.st_gid!=gid)||(s.st_mode&07777)!=mode||fstatat(parent,name,&r,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&s,&r)){close(fd);errno=EINVAL;return -1;}return fd;}
static int flush_dir(int fd){return fsync(fd)==0;}

typedef struct{const unsigned char*s;size_t n,i;} Parser;
static void ws(Parser*p){while(p->i<p->n&&(p->s[p->i]==' '||p->s[p->i]=='\t'||p->s[p->i]=='\r'||p->s[p->i]=='\n'))p->i++;}
static int take(Parser*p,unsigned char c){ws(p);if(p->i>=p->n||p->s[p->i]!=c)return 0;p->i++;return 1;}
static int utf8(const unsigned char*s,size_t n){size_t i=0;while(i<n){unsigned c=s[i++];if(c<128)continue;unsigned need,min,v;if((c&0xe0)==0xc0){need=1;min=0x80;v=c&31;}else if((c&0xf0)==0xe0){need=2;min=0x800;v=c&15;}else if((c&0xf8)==0xf0){need=3;min=0x10000;v=c&7;}else return 0;if(i+need>n)return 0;for(unsigned j=0;j<need;j++){unsigned d=s[i++];if((d&0xc0)!=0x80)return 0;v=(v<<6)|(d&63);}if(v<min||v>0x10ffff||(v>=0xd800&&v<=0xdfff))return 0;}return 1;}
static int hex4(Parser*p,unsigned*v){unsigned x=0;if(p->i+4>p->n)return 0;for(int i=0;i<4;i++){unsigned c=p->s[p->i++],d;if(c>='0'&&c<='9')d=c-'0';else if(c>='a'&&c<='f')d=c-'a'+10;else if(c>='A'&&c<='F')d=c-'A'+10;else return 0;x=(x<<4)|d;}*v=x;return 1;}
static int put_utf8(char*out,size_t cap,size_t*used,unsigned v){unsigned char b[4];size_t n;if(v<0x20)return 0;if(v<0x80){b[0]=v;n=1;}else if(v<0x800){b[0]=0xc0|(v>>6);b[1]=0x80|(v&63);n=2;}else if(v<0x10000){b[0]=0xe0|(v>>12);b[1]=0x80|((v>>6)&63);b[2]=0x80|(v&63);n=3;}else{b[0]=0xf0|(v>>18);b[1]=0x80|((v>>12)&63);b[2]=0x80|((v>>6)&63);b[3]=0x80|(v&63);n=4;}if(*used+n>=cap)return 0;memcpy(out+*used,b,n);*used+=n;return 1;}
static int string_value(Parser*p,char*out,size_t cap){size_t used=0;ws(p);if(!cap||p->i>=p->n||p->s[p->i++]!='"')return 0;while(p->i<p->n){unsigned c=p->s[p->i++];if(c=='"'){out[used]=0;return 1;}if(c<0x20)return 0;if(c!='\\'){if(used+1>=cap)return 0;out[used++]=(char)c;continue;}if(p->i>=p->n)return 0;c=p->s[p->i++];if(c=='"'||c=='\\'||c=='/'){if(used+1>=cap)return 0;out[used++]=(char)c;}else if(c=='b'||c=='f'||c=='n'||c=='r'||c=='t')return 0;else if(c=='u'){unsigned v,lo;if(!hex4(p,&v))return 0;if(v>=0xd800&&v<=0xdbff){if(p->i+2>p->n||p->s[p->i++]!='\\'||p->s[p->i++]!='u'||!hex4(p,&lo)||lo<0xdc00||lo>0xdfff)return 0;v=0x10000+((v-0xd800)<<10)+(lo-0xdc00);}else if(v>=0xdc00&&v<=0xdfff)return 0;if(!put_utf8(out,cap,&used,v))return 0;}else return 0;}return 0;}
static int skip_value(Parser*,unsigned);
static int skip_number(Parser*p){ws(p);size_t i=p->i;if(i<p->n&&p->s[i]=='-')i++;if(i>=p->n)return 0;if(p->s[i]=='0')i++;else{if(p->s[i]<'1'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}if(i<p->n&&p->s[i]=='.'){i++;if(i>=p->n||p->s[i]<'0'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}if(i<p->n&&(p->s[i]=='e'||p->s[i]=='E')){i++;if(i<p->n&&(p->s[i]=='+'||p->s[i]=='-'))i++;if(i>=p->n||p->s[i]<'0'||p->s[i]>'9')return 0;while(i<p->n&&p->s[i]>='0'&&p->s[i]<='9')i++;}p->i=i;return 1;}
static int skip_object(Parser*p,unsigned depth){char keys[32][128],key[128],tmp[512];size_t count=0;if(depth>8||!take(p,'{'))return 0;ws(p);if(p->i<p->n&&p->s[p->i]=='}'){p->i++;return 1;}for(;;){if(count==32||!string_value(p,key,sizeof key))return 0;for(size_t j=0;j<count;j++)if(!strcmp(keys[j],key))return 0;strcpy(keys[count++],key);if(!take(p,':')||!skip_value(p,depth+1))return 0;ws(p);if(p->i<p->n&&p->s[p->i]=='}'){p->i++;return 1;}if(!take(p,','))return 0;(void)tmp;}}
static int skip_array(Parser*p,unsigned depth){if(depth>8||!take(p,'['))return 0;ws(p);if(p->i<p->n&&p->s[p->i]==']'){p->i++;return 1;}for(;;){if(!skip_value(p,depth+1))return 0;ws(p);if(p->i<p->n&&p->s[p->i]==']'){p->i++;return 1;}if(!take(p,','))return 0;}}
static int skip_value(Parser*p,unsigned depth){char tmp[1024];ws(p);if(p->i>=p->n)return 0;unsigned c=p->s[p->i];if(c=='"')return string_value(p,tmp,sizeof tmp);if(c=='{')return skip_object(p,depth);if(c=='[')return skip_array(p,depth);if(c=='-'||(c>='0'&&c<='9'))return skip_number(p);for(const char **q=(const char*[]){"true","false","null",NULL};*q;q++){size_t n=strlen(*q);if(p->i+n<=p->n&&!memcmp(p->s+p->i,*q,n)){p->i+=n;return 1;}}return 0;}

typedef struct{char operation[32],nonce[65],capability[65];int schema_one;unsigned keys;int has_operation,has_nonce,has_capability,has_schema;} Request;
static __attribute__((unused)) int parse_request(const unsigned char*raw,size_t n,Request*r){
  if(!utf8(raw,n))return 0;Parser p={raw,n,0};char seen[16][128],key[128];size_t count=0;memset(r,0,sizeof *r);if(!take(&p,'{'))return 0;ws(&p);if(p.i<p.n&&p.s[p.i]=='}')p.i++;else for(;;){if(count==16||!string_value(&p,key,sizeof key))return 0;for(size_t j=0;j<count;j++)if(!strcmp(seen[j],key))return 0;strcpy(seen[count++],key);if(!take(&p,':'))return 0;if(!strcmp(key,"operation")){if(!string_value(&p,r->operation,sizeof r->operation))return 0;r->has_operation=1;}else if(!strcmp(key,"request_nonce")){if(!string_value(&p,r->nonce,sizeof r->nonce))return 0;r->has_nonce=1;}else if(!strcmp(key,"capability")){if(!string_value(&p,r->capability,sizeof r->capability))return 0;r->has_capability=1;}else if(!strcmp(key,"schema_version")){ws(&p);size_t start=p.i;if(!skip_value(&p,1))return 0;r->has_schema=1;r->schema_one=p.i-start==1&&p.s[start]=='1';}else if(!skip_value(&p,1))return 0;ws(&p);if(p.i<p.n&&p.s[p.i]=='}'){p.i++;break;}if(!take(&p,','))return 0;}ws(&p);if(p.i!=p.n)return 0;r->keys=(unsigned)count;return 1;
}

static int start_absolute_deadline(struct timespec *deadline){
  if(clock_gettime(CLOCK_MONOTONIC,deadline))return 0;
  deadline->tv_sec+=5;
  return 1;
}
static int deadline_remaining(const struct timespec *deadline){
  struct timespec now;
  if(clock_gettime(CLOCK_MONOTONIC,&now))return -1;
  time_t seconds=deadline->tv_sec-now.tv_sec;
  long nanoseconds=deadline->tv_nsec-now.tv_nsec;
  if(nanoseconds<0){seconds--;nanoseconds+=1000000000L;}
  if(seconds<0||(seconds==0&&nanoseconds<=0))return 0;
  long long milliseconds=(long long)seconds*1000LL+(nanoseconds+999999L)/1000000L;
  if(milliseconds<1)milliseconds=1;
  return milliseconds>INT_MAX?INT_MAX:(int)milliseconds;
}
static int wait_input_until(int fd,const struct timespec *deadline){
  for(;;){
    int timeout=deadline_remaining(deadline);
    if(timeout<=0)return 0;
    struct pollfd watched={fd,POLLIN|POLLHUP,0};
    int ready=poll(&watched,1,timeout);
    if(ready<0&&errno==EINTR)continue;
    if(ready<=0||watched.revents&(POLLERR|POLLNVAL))return 0;
    if(watched.revents&(POLLIN|POLLHUP))return deadline_remaining(deadline)>0;
  }
}
static int account_ancillary(struct msghdr *msg,int *ancillary){
  if(msg->msg_flags&(MSG_TRUNC|MSG_CTRUNC))return 0;
  for(struct cmsghdr*c=CMSG_FIRSTHDR(msg);c;c=CMSG_NXTHDR(msg,c)){
    *ancillary=1;
    if(c->cmsg_level==SOL_SOCKET&&c->cmsg_type==SCM_RIGHTS){
      size_t bytes=c->cmsg_len>=CMSG_LEN(0)?c->cmsg_len-CMSG_LEN(0):0;
      int*fds=(int*)CMSG_DATA(c);
      for(size_t i=0;i<bytes/sizeof(int);i++)close(fds[i]);
    }
  }
  return 1;
}
static int recv_piece(int fd,unsigned char*dst,size_t n,int *ancillary,const struct timespec *deadline){
  size_t at=0;
  while(at<n){
    if(!wait_input_until(fd,deadline))return 0;
    struct iovec iov={dst+at,n-at};
    unsigned char control[CMSG_SPACE(sizeof(int)*16)]={0};
    struct msghdr msg={0};
    msg.msg_iov=&iov;msg.msg_iovlen=1;msg.msg_control=control;msg.msg_controllen=sizeof control;
    ssize_t q=recvmsg(fd,&msg,MSG_DONTWAIT);
    if(q<0&&(errno==EINTR||errno==EAGAIN||errno==EWOULDBLOCK))continue;
    if(q<=0||deadline_remaining(deadline)<=0||!account_ancillary(&msg,ancillary))return 0;
    at+=(size_t)q;
  }
  return 1;
}
static __attribute__((unused)) int receive_frame(int fd,unsigned char **out,size_t *length){
  struct timespec request_deadline;
  if(!start_absolute_deadline(&request_deadline))return 0;
  unsigned char prefix[4],extra;
  int ancillary=0;
  if(!recv_piece(fd,prefix,4,&ancillary,&request_deadline))return 0;
  uint32_t n=(uint32_t)prefix[0]<<24|(uint32_t)prefix[1]<<16|(uint32_t)prefix[2]<<8|prefix[3];
  if(n>FRAME_MAX)return 0;
  unsigned char*raw=malloc(n?n:1);
  if(!raw)return 0;
  if(!recv_piece(fd,raw,n,&ancillary,&request_deadline)){free(raw);return 0;}
  for(;;){
    if(!wait_input_until(fd,&request_deadline)){free(raw);return 0;}
    struct iovec iov={&extra,1};
    unsigned char control[CMSG_SPACE(sizeof(int)*16)]={0};
    struct msghdr msg={0};
    msg.msg_iov=&iov;msg.msg_iovlen=1;msg.msg_control=control;msg.msg_controllen=sizeof control;
    ssize_t q=recvmsg(fd,&msg,MSG_DONTWAIT);
    if(q<0&&(errno==EINTR||errno==EAGAIN||errno==EWOULDBLOCK))continue;
    if(deadline_remaining(&request_deadline)<=0||!account_ancillary(&msg,&ancillary)||q!=0||ancillary){free(raw);return 0;}
    break;
  }
  *out=raw;*length=n;return 1;
}

static int exact_names(int directory,const char*const*allowed,size_t allowed_count,unsigned required){
  int scan=dup(directory);if(scan<0)return 0;DIR*stream=fdopendir(scan);if(!stream){close(scan);return 0;}unsigned seen=0;int ok=1;struct dirent*entry;errno=0;while((entry=readdir(stream))!=NULL){if(!strcmp(entry->d_name,".")||!strcmp(entry->d_name,".."))continue;size_t index;for(index=0;index<allowed_count;index++)if(!strcmp(entry->d_name,allowed[index]))break;if(index==allowed_count||index>=sizeof(unsigned)*8U||(seen&(1U<<index))){ok=0;break;}seen|=1U<<index;}if(errno)ok=0;if(closedir(stream))ok=0;return ok&&(seen&required)==required;
}
static int exact_empty(int directory){return exact_names(directory,NULL,0,0);}

#if defined(H039_INSTALLER) && (!defined(H039_MEDIATOR_SHA256) || !defined(H039_MEDIATOR_SIZE))
#error H039_MEDIATOR_SHA256 and H039_MEDIATOR_SIZE must bind the mediator artifact
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
typedef struct {
  int valid;
  char operation[32],nonce[65],capability_sha256[65],current_sha256[65];
  size_t current_length;
} RecoveryContinuation;

static int phase_known(const char*p){const char*v[]={"RESERVING","CREATING","PUBLISHING","PREPARING","PREPARED","ACTIVE","QUARANTINING","CLEANING",NULL};for(size_t i=0;v[i];i++)if(!strcmp(p,v[i]))return 1;return 0;}
static int phase_index(const char*p);
static int state_preimage(const State*s,char*out,size_t cap){return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%s\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"runtime_dev\":%llu,\"runtime_id\":\"%s\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}",s->cap,s->cleanup_nonce,s->create_nonce,s->fifo_dev,s->fifo_ino,s->object_dev,s->object_ino,s->phase,s->portal_dev,s->portal_ino,s->runtime_dev,s->runtime,s->runtime_ino,s->sequence,s->socket_dev,s->socket_ino);}
static int state_bytes(const State*s,char*out,size_t cap){char pre[4096],sum[65];int n=state_preimage(s,pre,sizeof pre);if(n<=0||(size_t)n>=sizeof pre)return -1;digest(pre,(size_t)n,sum);return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%s\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%s\",\"runtime_dev\":%llu,\"runtime_id\":\"%s\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}",s->cap,s->cleanup_nonce,s->create_nonce,s->fifo_dev,s->fifo_ino,s->object_dev,s->object_ino,s->phase,s->portal_dev,s->portal_ino,sum,s->runtime_dev,s->runtime,s->runtime_ino,s->sequence,s->socket_dev,s->socket_ino);}
static int parse_state_raw(const unsigned char*raw,size_t n,State*s){
  if(n>=4096)return 0;char text[4096],record[65];memcpy(text,raw,n);text[n]=0;memset(s,0,sizeof *s);int used=0,matched;
  matched=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"%64[0-9a-f]\",\"create_request_nonce\":\"%64[0-9a-f]\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%15[A-Z]\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%64[0-9a-f]\",\"runtime_dev\":%llu,\"runtime_id\":\"%32[0-9a-f]\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}%n",s->cap,s->cleanup_nonce,s->create_nonce,&s->fifo_dev,&s->fifo_ino,&s->object_dev,&s->object_ino,s->phase,&s->portal_dev,&s->portal_ino,record,&s->runtime_dev,s->runtime,&s->runtime_ino,&s->sequence,&s->socket_dev,&s->socket_ino,&used);
  if(matched!=17||(size_t)used!=n){memset(s,0,sizeof *s);matched=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"\",\"create_request_nonce\":\"%64[0-9a-f]\",\"fifo_dev\":%llu,\"fifo_ino\":%llu,\"object_dev\":%llu,\"object_ino\":%llu,\"phase\":\"%15[A-Z]\",\"portal_dev\":%llu,\"portal_ino\":%llu,\"record_sha256\":\"%64[0-9a-f]\",\"runtime_dev\":%llu,\"runtime_id\":\"%32[0-9a-f]\",\"runtime_ino\":%llu,\"schema_version\":1,\"sequence\":%llu,\"socket_dev\":%llu,\"socket_ino\":%llu}%n",s->cap,s->create_nonce,&s->fifo_dev,&s->fifo_ino,&s->object_dev,&s->object_ino,s->phase,&s->portal_dev,&s->portal_ino,record,&s->runtime_dev,s->runtime,&s->runtime_ino,&s->sequence,&s->socket_dev,&s->socket_ino,&used);if(matched!=16||(size_t)used!=n)return 0;}
  char pre[4096],sum[65],again[4096];int pn=state_preimage(s,pre,sizeof pre),an=state_bytes(s,again,sizeof again);if(pn<=0||an!=(int)n||memcmp(again,raw,n)||!lower_hex(s->cap,64)||!lower_hex(s->runtime,32)||!lower_hex(s->create_nonce,64)||(*s->cleanup_nonce&&!lower_hex(s->cleanup_nonce,64))||!phase_known(s->phase))return 0;digest(pre,(size_t)pn,sum);if(strcmp(sum,record)||!s->sequence)return 0;
  int phase=phase_index(s->phase);unsigned long long values[]={s->object_dev,s->object_ino,s->runtime_dev,s->runtime_ino,s->fifo_dev,s->fifo_ino,s->portal_dev,s->portal_ino,s->socket_dev,s->socket_ino};
  if((phase<6&&*s->cleanup_nonce)||(phase>=6&&!lower_hex(s->cleanup_nonce,64)))return 0;
  if(phase==0){for(size_t i=0;i<sizeof values/sizeof values[0];i++)if(values[i])return 0;}
  else if(!s->object_dev||!s->object_ino)return 0;
  if(phase==1){for(size_t i=2;i<sizeof values/sizeof values[0];i++)if(values[i])return 0;}
  if(phase>=2&&(!s->runtime_dev||!s->runtime_ino||!s->fifo_dev||!s->fifo_ino||!s->portal_dev||!s->portal_ino))return 0;
  if((phase==2||phase==3)&&(s->socket_dev||s->socket_ino))return 0;
  if(phase>=4){if(!s->socket_dev||!s->socket_ino)return 0;}
  if((s->socket_dev==0)!=(s->socket_ino==0))return 0;
  return 1;
}
static int receipt_preimage(const Receipt*r,char*out,size_t cap){return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1,\"sequence\":%llu,\"zero_runtime_residue\":true}",r->cap,r->cleanup_nonce,r->create_nonce,r->runtime,r->sequence);}
static int receipt_bytes(Receipt*r,char*out,size_t cap){char effect[1024];int en=receipt_preimage(r,effect,sizeof effect);if(en<=0||(size_t)en>=sizeof effect)return -1;digest(effect,(size_t)en,r->effect);return snprintf(out,cap,"{\"capability_sha256\":\"%s\",\"cleanup_request_nonce\":\"%s\",\"create_request_nonce\":\"%s\",\"effect_sha256\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1,\"sequence\":%llu}",r->cap,r->cleanup_nonce,r->create_nonce,r->effect,r->runtime,r->sequence);}
static int parse_receipt_raw(const unsigned char*raw,size_t n,Receipt*r){if(n>=2048)return 0;char text[2048],again[2048];memcpy(text,raw,n);text[n]=0;memset(r,0,sizeof *r);int used=0,got=sscanf(text,"{\"capability_sha256\":\"%64[0-9a-f]\",\"cleanup_request_nonce\":\"%64[0-9a-f]\",\"create_request_nonce\":\"%64[0-9a-f]\",\"effect_sha256\":\"%64[0-9a-f]\",\"runtime_id\":\"%32[0-9a-f]\",\"schema_version\":1,\"sequence\":%llu}%n",r->cap,r->cleanup_nonce,r->create_nonce,r->effect,r->runtime,&r->sequence,&used);char saved[65];strcpy(saved,r->effect);int an=receipt_bytes(r,again,sizeof again);return got==6&&(size_t)used==n&&an==(int)n&&!memcmp(again,raw,n)&&!strcmp(saved,r->effect)&&lower_hex(r->cap,64)&&lower_hex(r->cleanup_nonce,64)&&lower_hex(r->create_nonce,64)&&lower_hex(r->effect,64)&&lower_hex(r->runtime,32)&&r->sequence>0;}

static int open_store(Store*t){memset(t,-1,sizeof *t);t->ns=open(NS,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat s;if(t->ns<0||fstat(t->ns,&s)||!S_ISDIR(s.st_mode)||s.st_uid||s.st_gid||(s.st_mode&07777)!=0555)return 0;t->a=fixed_dir_at(t->ns,"a",0,0,0555);t->c=fixed_dir_at(t->ns,"c",0,0,0555);t->q=fixed_dir_at(t->ns,"q",0,0,0555);t->r=fixed_dir_at(t->ns,"r",0,0,0555);t->s=fixed_dir_at(t->ns,"s",0,0,0555);if(t->a<0||t->c<0||t->q<0||t->r<0||t->s<0)return 0;t->lock=stable_named_fd(t->s,"lock",O_RDWR,0,0,0600,0,NULL,NULL,&s);return t->lock>=0&&s.st_size==0;}
static void close_store(Store*t){int descriptors[]={t->ns,t->a,t->c,t->q,t->r,t->s,t->lock};for(size_t i=0;i<sizeof descriptors/sizeof descriptors[0];i++)if(descriptors[i]>=0)close(descriptors[i]);memset(t,-1,sizeof *t);}
static int acquire_lock(int fd){struct flock lk;memset(&lk,0,sizeof lk);lk.l_type=F_WRLCK;lk.l_whence=SEEK_SET;lk.l_start=0;lk.l_len=0;return fcntl(fd,F_OFD_SETLK,&lk)==0;}
static int read_named(int dir,const char*name,unsigned char**raw,size_t*n,struct stat*id){int fd=stable_named_fd(dir,name,O_RDONLY,0,0,0444,4096,raw,n,id);if(fd<0)return errno==ENOENT?0:-1;if(close(fd)){free(*raw);*raw=NULL;return -1;}return 1;}
static int state_present(Store*t,State*s){unsigned char*raw=NULL;size_t n=0;struct stat id;int found=read_named(t->s,"current",&raw,&n,&id);if(found<=0)return found;int ok=parse_state_raw(raw,n,s);free(raw);return ok?1:-1;}
static int last_present(Store*t,Receipt*r,unsigned char **bytes,size_t *length){struct stat id;unsigned char*raw=NULL;size_t n=0;int found=read_named(t->r,"last",&raw,&n,&id);if(found<=0)return found;int ok=parse_receipt_raw(raw,n,r);if(ok&&bytes)*bytes=raw;else free(raw);if(ok&&length)*length=n;return ok?1:-1;}
static int write_temp(int dir,const char*name,const void*raw,size_t n){int fd=openat(dir,name,O_WRONLY|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0444);if(fd<0)return 0;int ok=write_all(fd,raw,n)&&!fsync(fd)&&!fchown(fd,0,0)&&!fchmod(fd,0444)&&!fsync(fd);struct stat a,b;if(ok)ok=!fstat(fd,&a)&&S_ISREG(a.st_mode)&&a.st_uid==0&&a.st_gid==0&&(a.st_mode&07777)==0444&&a.st_nlink==1&&a.st_size==(off_t)n&&!fstatat(dir,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&a,&b);close(fd);return ok;}
static int publish_temp(int dir,const char*tmp,const char*final,int absent){unsigned flags=RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH|(absent?RENAME_EXCL:0);return renameatx_np(dir,tmp,dir,final,flags)==0&&flush_dir(dir);}
static int put_state(Store*t,const State*s,int absent){char raw[4096];int n=state_bytes(s,raw,sizeof raw);return n>0&&(size_t)n<sizeof raw&&write_temp(t->s,".current.tmp",raw,(size_t)n)&&publish_temp(t->s,".current.tmp","current",absent);}
static int remove_state(Store*t){return unlinkat(t->s,"current",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_UNIQUE)==0&&flush_dir(t->s);}

static int error_frame(int fd,const char*nonce,const char*reason){char body[512];int n=snprintf(body,sizeof body,"{\"operation\":\"error-v1\",\"reason\":\"%s\",\"request_nonce\":\"%s\",\"schema_version\":1}",reason,nonce);if(n<=0||(size_t)n>=sizeof body)return 0;unsigned char prefix[4]={(unsigned char)((unsigned)n>>24),(unsigned char)((unsigned)n>>16),(unsigned char)((unsigned)n>>8),(unsigned char)n};return write_all(fd,prefix,4)&&write_all(fd,body,(size_t)n);}
static int json_frame(int fd,const char*body){size_t n=strlen(body);if(n>FRAME_MAX)return 0;unsigned char prefix[4]={(unsigned char)(n>>24),(unsigned char)(n>>16),(unsigned char)(n>>8),(unsigned char)n};return write_all(fd,prefix,4)&&write_all(fd,body,n);}

static int object_name(const State*s,char out[35]){return snprintf(out,35,"o-%s",s->runtime)==34;}
static int open_exact_dir(int parent,const char*name,uid_t uid,gid_t gid,mode_t mode,unsigned long long dev,unsigned long long ino){int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat a,b;if(fd<0)return -1;if(fstat(fd,&a)||!S_ISDIR(a.st_mode)||a.st_uid!=uid||a.st_gid!=gid||(a.st_mode&07777)!=mode||a.st_nlink<2||(dev&&((unsigned long long)a.st_dev!=dev||(unsigned long long)a.st_ino!=ino))||fstatat(parent,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&a,&b)){close(fd);errno=EINVAL;return -1;}return fd;}
static int create_dir_owned(int parent,const char*name,uid_t uid,gid_t gid,mode_t mode){if(mkdirat(parent,name,0700))return -1;int fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat a,b;if(fd<0||fchown(fd,uid,gid)||fchmod(fd,mode)||fsync(fd)||fstat(fd,&a)||!S_ISDIR(a.st_mode)||a.st_uid!=uid||a.st_gid!=gid||(a.st_mode&07777)!=mode||fstatat(parent,name,&b,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&a,&b)||!flush_dir(parent)){if(fd>=0)close(fd);return -1;}return fd;}
static int hex_bytes(const char*hex,unsigned char*out,size_t n){if(!lower_hex(hex,n*2))return 0;for(size_t i=0;i<n;i++){unsigned a=hex[2*i],b=hex[2*i+1];a=a<='9'?a-'0':a-'a'+10;b=b<='9'?b-'0':b-'a'+10;out[i]=(unsigned char)((a<<4)|b);}return 1;}
static int load_private_python(unsigned char**out,size_t*n){
  if(seteuid(CLIENT_UID))return 0;int fd=open(PYTHON_SOURCE,O_RDONLY|O_CLOEXEC|O_NONBLOCK|O_NOFOLLOW_ANY|O_UNIQUE);struct stat a,b;int ok=fd>=0&&!fstat(fd,&a)&&S_ISREG(a.st_mode)&&a.st_uid==CLIENT_UID&&a.st_gid==80&&(a.st_mode&07777)==0755&&a.st_nlink==1&&a.st_size==33568&&stable_read_fd(fd,33568,out,n,&a)&&!lstat(PYTHON_SOURCE,&b)&&same_stat(&a,&b);char sum[65]={0};if(ok)digest(*out,*n,sum);if(fd>=0&&close(fd))ok=0;if(ok&&strcmp(sum,PYTHON_SHA256))ok=0;if(seteuid(0))_exit(125);if(!ok){free(*out);*out=NULL;return 0;}return 1;
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
static int fifo_ack(int reader){
  struct timespec ack_deadline;
  if(!start_absolute_deadline(&ack_deadline))return 0;
  unsigned char bytes[2];
  ssize_t n;
  for(;;){
    if(!wait_input_until(reader,&ack_deadline))return 0;
    n=read(reader,bytes,sizeof bytes);
    if(n<0&&(errno==EINTR||errno==EAGAIN||errno==EWOULDBLOCK))continue;
    break;
  }
  if(deadline_remaining(&ack_deadline)<=0||n!=1||bytes[0]!='A')return 0;
  for(;;){
    n=read(reader,bytes,1);
    if(n<0&&errno==EINTR){
      if(deadline_remaining(&ack_deadline)<=0)return 0;
      continue;
    }
    break;
  }
  return n<0&&(errno==EAGAIN||errno==EWOULDBLOCK);
}
static unsigned long long next_sequence(Store*t){Receipt last;int p=last_present(t,&last,NULL,NULL);return p==0?1:p==1?last.sequence+1:0;}

static int create_runtime_object(Store*t,const Request*request){
  State s;memset(&s,0,sizeof s);strcpy(s.phase,"RESERVING");random_hex(s.runtime,16);strcpy(s.create_nonce,request->nonce);char capability[65];random_hex(capability,32);unsigned char capraw[32];if(!hex_bytes(capability,capraw,32))return 0;digest(capraw,sizeof capraw,s.cap);s.sequence=next_sequence(t);if(!s.sequence||!put_state(t,&s,1))return 0;
  char name[35];if(!object_name(&s,name))return 0;int object=create_dir_owned(t->c,name,0,0,0700);if(object<0)return 0;struct stat object_stat;if(fstat(object,&object_stat)){close(object);return 0;}s.object_dev=(unsigned long long)object_stat.st_dev;s.object_ino=(unsigned long long)object_stat.st_ino;strcpy(s.phase,"CREATING");if(!put_state(t,&s,0)){close(object);return 0;}
  int hidden=-1,runtime=-1,reader=-1,writer=-1,portal=-1,listener=-1;unsigned char*python=NULL;size_t python_n=0;int ok=0;struct stat runtime_stat,fifo_stat,portal_stat,socket_stat,python_stat;
  hidden=create_dir_owned(object,"h",0,0,0700);if(hidden<0)goto done;runtime=create_dir_owned(hidden,"r",CLIENT_UID,CLIENT_GID,0700);if(runtime<0||mkfifoat(hidden,"l",0600))goto done;reader=openat(hidden,"l",O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);writer=openat(hidden,"l",O_WRONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);struct stat fifo_rebound;if(reader<0||writer<0||fchown(reader,0,0)||fchmod(reader,0600)||fstat(runtime,&runtime_stat)||fstat(writer,&fifo_stat)||fstatat(hidden,"l",&fifo_rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&fifo_stat,&fifo_rebound)||!S_ISFIFO(fifo_stat.st_mode)||fifo_stat.st_uid||fifo_stat.st_gid||(fifo_stat.st_mode&07777)!=0600||fifo_stat.st_nlink!=1||!flush_dir(hidden))goto done;
  portal=create_dir_owned(object,"p",0,CLIENT_GID,0700);const char*object_members[]={"h","p"},*hidden_members[]={"r","l"},*portal_members[]={"python"};if(portal<0||!load_private_python(&python,&python_n)||!create_python(portal,python,python_n,&python_stat)||!exact_names(hidden,hidden_members,2,3U)||!exact_names(portal,portal_members,1,1U)||!exact_names(object,object_members,2,3U)||!flush_dir(portal)||!flush_dir(hidden)||fchmod(portal,0550)||fsync(portal)||fchmod(object,0555)||fsync(object)||!flush_dir(t->c)||fstat(portal,&portal_stat))goto done;
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
  while(ok&&(e=readdir(d))!=NULL){if(!strcmp(e->d_name,".")||!strcmp(e->d_name,".."))continue;size_t name_n=strlen(e->d_name);if(!name_n||name_n>255||!utf8((const unsigned char*)e->d_name,name_n)||strchr(e->d_name,'/')){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}if(++c->count>TREE_FILES_MAX){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}struct stat st;if(fstatat(dir,e->d_name,&st,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||st.st_dev!=device){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}
    if(S_ISDIR(st.st_mode)){int child=openat(dir,e->d_name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat opened,rebound;if(child<0||fstat(child,&opened)||!same_stat(&st,&opened)||fstatat(dir,e->d_name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&opened,&rebound)){if(child>=0)close(child);c->reason="INCOMPLETE_IDENTITY";ok=0;break;}if(!clean_contents(child,device,depth+1,c)){close(child);ok=0;break;}close(child);if(unlinkat(dir,e->d_name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY)){c->reason=delete_reason(errno);ok=0;break;}}
    else if(S_ISREG(st.st_mode)||S_ISLNK(st.st_mode)||S_ISFIFO(st.st_mode)||S_ISSOCK(st.st_mode)){if(S_ISREG(st.st_mode)){if(st.st_size<0||(c->bytes+=(unsigned long long)st.st_size)>TREE_BYTES_MAX){c->reason="INCOMPLETE_IDENTITY";ok=0;break;}}if(unlinkat(dir,e->d_name,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE)){c->reason=delete_reason(errno);ok=0;break;}}
    else{c->reason="INCOMPLETE_IDENTITY";ok=0;break;}
  }
  closedir(d);return ok;
}
static int locate_object(Store*t,const State*s,int *parent,char name[35]){
  if(!object_name(s,name))return -1;int candidates[3]={t->c,t->a,t->q},found=-1,count=0;for(int i=0;i<3;i++){struct stat st;if(fstatat(candidates[i],name,&st,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISDIR(st.st_mode)||(s->object_dev&&((unsigned long long)st.st_dev!=s->object_dev||(unsigned long long)st.st_ino!=s->object_ino)))return -1;found=candidates[i];count++;}else if(errno!=ENOENT)return -1;}if(count>1)return -1;*parent=found;return count;
}
static int validate_store_shape(Store*t,const State*s,int *receipt_temp_present){
  const char*fixed[]={"a","c","q","r","s"};if(!exact_names(t->ns,fixed,5,31U))return 0;const char*state_names[]={"lock","current"};if(!exact_names(t->s,state_names,2,3U))return 0;
  const char*receipt_names[]={"last",".last.tmp"};if(!exact_names(t->r,receipt_names,2,0))return 0;Receipt last;int has_last=last_present(t,&last,NULL,NULL);if(has_last<0||(has_last==0&&s->sequence!=1)||(has_last==1&&last.sequence+1!=s->sequence))return 0;
  unsigned char*temp_raw=NULL;size_t temp_n=0;struct stat temp_id;int has_temp=read_named(t->r,".last.tmp",&temp_raw,&temp_n,&temp_id);Receipt temp;int temp_ok=has_temp==0||(has_temp==1&&parse_receipt_raw(temp_raw,temp_n,&temp));free(temp_raw);if(has_temp<0||!temp_ok)return 0;
  char name[35];if(!object_name(s,name))return 0;const char*only[]={name};if(!exact_names(t->a,only,1,0)||!exact_names(t->c,only,1,0)||!exact_names(t->q,only,1,0))return 0;int parent=-1,located=locate_object(t,s,&parent,name);if(located<0)return 0;int phase=phase_index(s->phase),orientation=0;
  if(phase==0)orientation=located==0||parent==t->c;else if(phase==1)orientation=located==1&&parent==t->c;else if(phase==2)orientation=located==1&&(parent==t->c||parent==t->a);else if(phase>=3&&phase<=5)orientation=located==1&&parent==t->a;else if(phase==6)orientation=located==1&&(parent==t->a||parent==t->q);else if(phase==7)orientation=(located==1&&parent==t->q)||(located==0&&has_temp==1);if(!orientation)return 0;
  if(located==1){int object=open_exact_dir(parent,name,0,0,phase<=1?0700:0555,s->object_dev,s->object_ino);if(object<0)return 0;int object_ok=(phase!=0&&has_temp!=1)||exact_empty(object);if(close(object))object_ok=0;if(!object_ok)return 0;}
  if(has_temp==1){if(phase!=7||strcmp(temp.runtime,s->runtime)||strcmp(temp.cap,s->cap)||strcmp(temp.create_nonce,s->create_nonce)||strcmp(temp.cleanup_nonce,s->cleanup_nonce)||temp.sequence!=s->sequence||!strcmp(temp.cleanup_nonce,s->create_nonce)||(has_last==1&&(!strcmp(temp.create_nonce,last.create_nonce)||!strcmp(temp.create_nonce,last.cleanup_nonce)||!strcmp(temp.cleanup_nonce,last.create_nonce)||!strcmp(temp.cleanup_nonce,last.cleanup_nonce))))return 0;}if(receipt_temp_present)*receipt_temp_present=has_temp==1;return 1;
}
static int terminal_receipt(Store*t,Receipt*r,unsigned char **raw,size_t *length){struct stat id;int found=read_named(t->r,".last.tmp",raw,length,&id);if(found<=0)return found;if(!parse_receipt_raw(*raw,*length,r)){free(*raw);*raw=NULL;return -1;}return 1;}
static int validated_terminal_receipt(Store*t,Receipt*r,unsigned char **raw,size_t *length){
  int found=terminal_receipt(t,r,raw,length);if(found<=0)return found;const char*fixed[]={"a","c","q","r","s"},*state_names[]={"lock"},*receipt_names[]={"last",".last.tmp"};int ok=exact_names(t->ns,fixed,5,31U)&&exact_names(t->s,state_names,1,1U)&&exact_empty(t->a)&&exact_empty(t->c)&&exact_empty(t->q)&&exact_names(t->r,receipt_names,2,2U);Receipt last;int has_last=last_present(t,&last,NULL,NULL);if(has_last<0||(has_last==0&&r->sequence!=1)||(has_last==1&&last.sequence+1!=r->sequence))ok=0;if(ok&&(!strcmp(r->cleanup_nonce,r->create_nonce)||(has_last==1&&(!strcmp(r->create_nonce,last.create_nonce)||!strcmp(r->create_nonce,last.cleanup_nonce)||!strcmp(r->cleanup_nonce,last.create_nonce)||!strcmp(r->cleanup_nonce,last.cleanup_nonce)))))ok=0;if(!ok){free(*raw);*raw=NULL;*length=0;return -1;}return 1;
}
static int validate_idle_store(Store*t){const char*fixed[]={"a","c","q","r","s"},*state_names[]={"lock"},*receipt_names[]={"last"};return exact_names(t->ns,fixed,5,31U)&&exact_names(t->s,state_names,1,1U)&&exact_names(t->r,receipt_names,1,0)&&exact_empty(t->a)&&exact_empty(t->c)&&exact_empty(t->q);}
static int fifo_eof_for(Store*t,const State*s,int *reader,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(located==0&&!strcmp(s->phase,"CLEANING")){*reader=-1;return 1;}if(located!=1){*reason="INCOMPLETE_IDENTITY";return -1;}int object=open_exact_dir(parent,name,0,0,(!strcmp(s->phase,"RESERVING")||!strcmp(s->phase,"CREATING"))?0700:0555,s->object_dev,s->object_ino);if(object<0){*reason="INCOMPLETE_IDENTITY";return -1;}int hidden=open_exact_dir(object,"h",0,0,0700,0,0);if(hidden<0){int missing=errno==ENOENT&&!strcmp(s->phase,"CLEANING");close(object);if(missing){*reader=-1;return 1;}*reason="INCOMPLETE_IDENTITY";return -1;}int fd=openat(hidden,"l",O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE);struct stat st;int saved=errno;close(hidden);close(object);errno=saved;if(fd<0){if(!strcmp(s->phase,"CLEANING")&&errno==ENOENT){*reader=-1;return 1;}*reason="INCOMPLETE_IDENTITY";return -1;}if(fstat(fd,&st)||!S_ISFIFO(st.st_mode)||(unsigned long long)st.st_dev!=s->fifo_dev||(unsigned long long)st.st_ino!=s->fifo_ino||st.st_uid||st.st_gid||(st.st_mode&07777)!=0600||st.st_nlink!=1){close(fd);*reason="INCOMPLETE_IDENTITY";return -1;}unsigned char bytes[2];ssize_t n;do{n=read(fd,bytes,sizeof bytes);}while(n<0&&errno==EINTR);if(n<0&&(errno==EAGAIN||errno==EWOULDBLOCK)){close(fd);return 0;}if(n!=0){close(fd);*reason="INCOMPLETE_IDENTITY";return -1;}*reader=fd;return 1;
}
static int quarantine(Store*t,State*s,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(located!=1){*reason="INCOMPLETE_IDENTITY";return 0;}
  if(!strcmp(s->phase,"ACTIVE")){strcpy(s->phase,"QUARANTINING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}parent=t->a;}
  if(!strcmp(s->phase,"PUBLISHING")){char cleanup[65];strcpy(cleanup,s->cleanup_nonce);s->cleanup_nonce[0]=0;if(parent==t->c){if(renameatx_np(t->c,name,t->a,name,RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH)||!flush_dir(t->c)||!flush_dir(t->a)){*reason=delete_reason(errno);return 0;}parent=t->a;}if(parent!=t->a){*reason="INCOMPLETE_IDENTITY";return 0;}strcpy(s->phase,"PREPARING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}strcpy(s->cleanup_nonce,cleanup);}
  if((!strcmp(s->phase,"QUARANTINING")||!strcmp(s->phase,"PREPARING")||!strcmp(s->phase,"PREPARED")||!strcmp(s->phase,"ACTIVE"))&&parent==t->a){if(strcmp(s->phase,"QUARANTINING")){strcpy(s->phase,"QUARANTINING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}}if(renameatx_np(t->a,name,t->q,name,RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH)||!flush_dir(t->a)||!flush_dir(t->q)){*reason=delete_reason(errno);return 0;}parent=t->q;}
  if(parent!=t->q){*reason="INCOMPLETE_IDENTITY";return 0;}strcpy(s->phase,"CLEANING");if(!put_state(t,s,0)){*reason="INCOMPLETE_IDENTITY";return 0;}return 1;
}
static int remove_registered_object(Store*t,State*s,int *lease_reader,const char **reason,int *object_present){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);*object_present=0;if(located==0&&!strcmp(s->phase,"CLEANING"))return 1;if(located!=1||parent!=t->q){*reason="INCOMPLETE_IDENTITY";return 0;}*object_present=1;
  int object=open_exact_dir(t->q,name,0,0,0555,s->object_dev,s->object_ino);if(object<0){*reason="INCOMPLETE_IDENTITY";return 0;}Clean clean={0,0,0,"INCOMPLETE_IDENTITY"};int ok=1;
  int hidden=open_exact_dir(object,"h",0,0,0700,0,0);if(hidden<0&&errno!=ENOENT)ok=0;if(ok&&hidden>=0){
    int runtime=open_exact_dir(hidden,"r",CLIENT_UID,CLIENT_GID,0700,s->runtime_dev,s->runtime_ino);if(runtime<0&&errno!=ENOENT)ok=0;if(ok&&runtime>=0){struct stat rootst;if(fstat(runtime,&rootst)||!clean_contents(runtime,rootst.st_dev,0,&clean))ok=0;if(close(runtime))ok=0;if(ok&&unlinkat(hidden,"r",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);}
    if(ok){if(*lease_reader>=0){if(close(*lease_reader))ok=0;*lease_reader=-1;}struct stat fifo;if(ok&&fstatat(hidden,"l",&fifo,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISFIFO(fifo.st_mode)||(unsigned long long)fifo.st_dev!=s->fifo_dev||(unsigned long long)fifo.st_ino!=s->fifo_ino||fifo.st_uid||fifo.st_gid||(fifo.st_mode&07777)!=0600||fifo.st_nlink!=1)ok=0,clean.reason="INCOMPLETE_IDENTITY";else if(unlinkat(hidden,"l",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);}else if(ok&&errno!=ENOENT)ok=0,clean.reason="INCOMPLETE_IDENTITY";}
    if(close(hidden))ok=0;if(ok&&unlinkat(object,"h",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);
  }
  int portal=-1;if(ok){portal=open_exact_dir(object,"p",0,CLIENT_GID,0550,s->portal_dev,s->portal_ino);if(portal<0&&errno!=ENOENT)ok=0;}if(ok&&portal>=0){
    struct stat socket_named;if(fstatat(portal,"c",&socket_named,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){if(!S_ISSOCK(socket_named.st_mode)||(s->socket_dev&&((unsigned long long)socket_named.st_dev!=s->socket_dev||(unsigned long long)socket_named.st_ino!=s->socket_ino))||socket_named.st_uid||socket_named.st_gid!=CLIENT_GID||(socket_named.st_mode&07777)!=0620||socket_named.st_nlink!=1)ok=0,clean.reason="INCOMPLETE_IDENTITY";else if(unlinkat(portal,"c",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);}else if(errno!=ENOENT)ok=0,clean.reason="INCOMPLETE_IDENTITY";
    if(ok){unsigned char*python=NULL;size_t python_n=0;struct stat python_id;int python_fd=stable_named_fd(portal,"python",O_RDONLY,0,0,0555,33568,&python,&python_n,&python_id);if(python_fd<0&&errno!=ENOENT)ok=0,clean.reason="INCOMPLETE_IDENTITY";if(python_fd>=0){char sum[65];digest(python,python_n,sum);free(python);if(close(python_fd)||python_n!=33568||strcmp(sum,PYTHON_SHA256))ok=0,clean.reason="INCOMPLETE_IDENTITY";else if(unlinkat(portal,"python",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY|AT_UNIQUE))ok=0,clean.reason=delete_reason(errno);}}
    if(close(portal))ok=0;if(ok&&unlinkat(object,"p",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);
  }
  if(close(object))ok=0;if(!ok)*reason=clean.reason;return ok;
}
static int prepare_receipt(Store*t,const State*s,char digest_out[65],int *already_present){
  Receipt receipt;memset(&receipt,0,sizeof receipt);strcpy(receipt.runtime,s->runtime);strcpy(receipt.cap,s->cap);strcpy(receipt.create_nonce,s->create_nonce);strcpy(receipt.cleanup_nonce,s->cleanup_nonce);receipt.sequence=s->sequence;char raw[2048];int n=receipt_bytes(&receipt,raw,sizeof raw);if(n<=0||(size_t)n>=sizeof raw)return 0;
  Receipt last;int has_last=last_present(t,&last,NULL,NULL);if(has_last<0||(has_last==0&&s->sequence!=1)||(has_last==1&&last.sequence+1!=s->sequence))return 0;
  unsigned char*existing=NULL;size_t existing_n=0;struct stat id;int found=read_named(t->r,".last.tmp",&existing,&existing_n,&id);if(found<0)return 0;*already_present=found==1;if(found==0){if(!write_temp(t->r,".last.tmp",raw,(size_t)n)||!flush_dir(t->r))return 0;}else{int equal=existing_n==(size_t)n&&!memcmp(existing,raw,(size_t)n);free(existing);if(!equal)return 0;}digest(raw,(size_t)n,digest_out);return 1;
}
static int publish_prepared_receipt(Store*t){struct stat pending;int has_last=fstatat(t->r,"last",&pending,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0;if(!has_last&&errno!=ENOENT)return 0;if(!remove_state(t))return 0;return publish_temp(t->r,".last.tmp","last",!has_last);}
static int finish_cleanup(Store*t,State*s,int *lease_reader,const char **reason,char receipt_sha[65]){
  int object_present=0;if(!remove_registered_object(t,s,lease_reader,reason,&object_present))return 0;int temp_preexisting=0;if(!prepare_receipt(t,s,receipt_sha,&temp_preexisting)){*reason="INCOMPLETE_IDENTITY";return 0;}char name[35];if(!object_name(s,name))return 0;if(object_present){if(unlinkat(t->q,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY)||!flush_dir(t->q)){*reason=delete_reason(errno);return 0;}}else if(!temp_preexisting){*reason="INCOMPLETE_IDENTITY";return 0;}if(!publish_prepared_receipt(t)){*reason="INCOMPLETE_IDENTITY";return 0;}return 1;
}

static int remove_prepublication(Store*t,State*s,const char **reason){
  char name[35];int parent=-1,located=locate_object(t,s,&parent,name);if(!strcmp(s->phase,"RESERVING")){if(located==1){int fd=open_exact_dir(t->c,name,0,0,0700,0,0);if(fd<0){*reason="INCOMPLETE_IDENTITY";return 0;}DIR*d=fdopendir(dup(fd));struct dirent*e;int empty=1;while(d&&(e=readdir(d)))if(strcmp(e->d_name,".")&&strcmp(e->d_name,".."))empty=0;if(d)closedir(d);close(fd);if(!empty||unlinkat(t->c,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY)){*reason=delete_reason(errno);return 0;}}else if(located<0){*reason="INCOMPLETE_IDENTITY";return 0;}return remove_state(t);}
  if(strcmp(s->phase,"CREATING")||located!=1||parent!=t->c){*reason="INCOMPLETE_IDENTITY";return 0;}int object=open_exact_dir(t->c,name,0,0,0700,s->object_dev,s->object_ino);if(object<0){*reason="INCOMPLETE_IDENTITY";return 0;}struct stat st;if(fstat(object,&st)){close(object);return 0;}Clean clean={0,0,0,"INCOMPLETE_IDENTITY"};int ok=clean_contents(object,st.st_dev,0,&clean);close(object);if(ok&&unlinkat(t->c,name,AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_NODELETEBUSY))ok=0,clean.reason=delete_reason(errno);if(ok)ok=flush_dir(t->c)&&remove_state(t);if(!ok)*reason=clean.reason;return ok;
}

static int state_tx_equal(const State*a,const State*b){return !strcmp(a->runtime,b->runtime)&&!strcmp(a->cap,b->cap)&&!strcmp(a->create_nonce,b->create_nonce)&&a->sequence==b->sequence;}
static int state_ids_equal(const State*a,const State*b){return a->object_dev==b->object_dev&&a->object_ino==b->object_ino&&a->runtime_dev==b->runtime_dev&&a->runtime_ino==b->runtime_ino&&a->fifo_dev==b->fifo_dev&&a->fifo_ino==b->fifo_ino&&a->portal_dev==b->portal_dev&&a->portal_ino==b->portal_ino&&a->socket_dev==b->socket_dev&&a->socket_ino==b->socket_ino;}
static int same_regular_identity(const struct stat*a,const struct stat*b){return a->st_dev==b->st_dev&&a->st_ino==b->st_ino&&S_ISREG(a->st_mode)&&S_ISREG(b->st_mode)&&a->st_mode==b->st_mode&&a->st_uid==b->st_uid&&a->st_gid==b->st_gid&&a->st_nlink==b->st_nlink&&a->st_size==b->st_size;}
typedef struct {dev_t dev;ino_t ino;} RuntimeIdentity;
typedef struct {unsigned count;unsigned long long bytes;RuntimeIdentity identities[TREE_FILES_MAX];} RuntimeAudit;
static int audit_identity(RuntimeAudit*a,const struct stat*s){
  if(a->count>=TREE_FILES_MAX)return 0;for(unsigned i=0;i<a->count;i++)if(a->identities[i].dev==s->st_dev&&a->identities[i].ino==s->st_ino)return 0;a->identities[a->count].dev=s->st_dev;a->identities[a->count].ino=s->st_ino;a->count++;return 1;
}
static int validate_runtime_contents(int directory,dev_t device,unsigned depth,RuntimeAudit*a){
  if(depth>TREE_DEPTH_MAX)return 0;int scan=dup(directory);if(scan<0)return 0;DIR*stream=fdopendir(scan);if(!stream){close(scan);return 0;}int ok=1;struct dirent*entry;errno=0;
  while(ok&&(entry=readdir(stream))!=NULL){
    if(!strcmp(entry->d_name,".")||!strcmp(entry->d_name,".."))continue;size_t name_length=strlen(entry->d_name);if(!name_length||name_length>255||strchr(entry->d_name,'/')||!utf8((const unsigned char*)entry->d_name,name_length)){ok=0;break;}
    struct stat named,rebound;if(fstatat(directory,entry->d_name,&named,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||named.st_dev!=device||!audit_identity(a,&named)){ok=0;break;}
    if(S_ISDIR(named.st_mode)){
      int child=openat(directory,entry->d_name,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat opened;if(child<0||fstat(child,&opened)||!same_stat(&named,&opened)||fstatat(directory,entry->d_name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&opened,&rebound)||!validate_runtime_contents(child,device,depth+1,a)){if(child>=0)close(child);ok=0;break;}if(close(child)){ok=0;break;}
    }else if(S_ISREG(named.st_mode)||S_ISLNK(named.st_mode)||S_ISFIFO(named.st_mode)||S_ISSOCK(named.st_mode)){
      if(named.st_nlink!=1||(S_ISREG(named.st_mode)&&(named.st_size<0||(a->bytes+=(unsigned long long)named.st_size)>TREE_BYTES_MAX))||fstatat(directory,entry->d_name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&named,&rebound)){ok=0;break;}
    }else{ok=0;break;}
  }
  if(errno)ok=0;if(closedir(stream))ok=0;return ok;
}
static int exact_leaf(int directory,const char*name,mode_t kind,uid_t uid,gid_t gid,mode_t mode,unsigned long long dev,unsigned long long ino){
  struct stat first,second;if(fstatat(directory,name,&first,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||fstatat(directory,name,&second,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&first,&second)||((first.st_mode&S_IFMT)!=kind)||first.st_uid!=uid||first.st_gid!=gid||(first.st_mode&07777)!=mode||first.st_nlink!=1)return 0;return (!dev||((unsigned long long)first.st_dev==dev&&(unsigned long long)first.st_ino==ino));
}
static int exact_python(int portal){
  unsigned char*raw=NULL;size_t length=0;struct stat identity;int fd=stable_named_fd(portal,"python",O_RDONLY,0,0,0555,33568,&raw,&length,&identity);if(fd<0)return 0;char sum[65]={0};if(raw)digest(raw,length,sum);free(raw);return close(fd)==0&&length==33568&&!strcmp(sum,PYTHON_SHA256);
}
static int validate_quarantine_progress(Store*t,const State*s){
  char name[35];if(!object_name(s,name))return 0;const char*only[]={name};if(!exact_empty(t->a)||!exact_empty(t->c)||!exact_names(t->q,only,1,1U))return 0;int object=open_exact_dir(t->q,name,0,0,0555,s->object_dev,s->object_ino);if(object<0)return 0;
  const char*object_full[]={"h","p"},*object_portal[]={"p"},*hidden_full[]={"r","l"},*hidden_fifo[]={"l"},*portal_full[]={"c","python"},*portal_python[]={"python"};int progress=-1,hidden=-1,portal=-1,runtime=-1,ok=1;
  if(exact_names(object,object_full,2,3U)){
    hidden=open_exact_dir(object,"h",0,0,0700,0,0);portal=open_exact_dir(object,"p",0,CLIENT_GID,0550,s->portal_dev,s->portal_ino);if(hidden<0||portal<0)ok=0;else if(!exact_names(portal,portal_full,2,3U))ok=0;else if(exact_names(hidden,hidden_full,2,3U))progress=0;else if(exact_names(hidden,hidden_fifo,1,1U))progress=1;else if(exact_empty(hidden))progress=2;else ok=0;
  }else if(exact_names(object,object_portal,1,1U)){
    portal=open_exact_dir(object,"p",0,CLIENT_GID,0550,s->portal_dev,s->portal_ino);if(portal<0)ok=0;else if(exact_names(portal,portal_full,2,3U))progress=3;else if(exact_names(portal,portal_python,1,1U))progress=4;else if(exact_empty(portal))progress=5;else ok=0;
  }else if(exact_empty(object))progress=6;else ok=0;
  if(ok&&progress==0){runtime=open_exact_dir(hidden,"r",CLIENT_UID,CLIENT_GID,0700,s->runtime_dev,s->runtime_ino);if(runtime<0)ok=0;else{struct stat root;RuntimeAudit audit;memset(&audit,0,sizeof audit);if(fstat(runtime,&root)||root.st_dev!=(dev_t)s->runtime_dev||!validate_runtime_contents(runtime,root.st_dev,0,&audit))ok=0;}}
  if(ok&&progress<=1&&!exact_leaf(hidden,"l",S_IFIFO,0,0,0600,s->fifo_dev,s->fifo_ino))ok=0;
  if(ok&&progress<=3&&(!exact_leaf(portal,"c",S_IFSOCK,0,CLIENT_GID,0620,s->socket_dev,s->socket_ino)||!exact_python(portal)))ok=0;
  if(ok&&progress==4&&!exact_python(portal))ok=0;
  if(runtime>=0&&close(runtime))ok=0;if(hidden>=0&&close(hidden))ok=0;if(portal>=0&&close(portal))ok=0;if(close(object))ok=0;
  if(!ok||progress<0)return 0;return !strcmp(s->phase,"QUARANTINING")?progress==0:!strcmp(s->phase,"CLEANING");
}
static int valid_predecessor(Store*t,const State*s,Receipt*last,int*has_last){
  const char*receipt_names[]={"last"};*has_last=last_present(t,last,NULL,NULL);if(*has_last<0||!exact_names(t->r,receipt_names,1,s->sequence==1?0U:1U)||(*has_last==0)!=(s->sequence==1))return 0;if(*has_last==0)return 1;return last->sequence+1==s->sequence&&strcmp(last->create_nonce,last->cleanup_nonce)&&strcmp(s->create_nonce,last->create_nonce)&&strcmp(s->create_nonce,last->cleanup_nonce)&&strcmp(s->cleanup_nonce,last->create_nonce)&&strcmp(s->cleanup_nonce,last->cleanup_nonce);
}
static int valid_cleanup_reconciliation(Store*t,const State*old,const State*next){
  const char*fixed[]={"a","c","q","r","s"};if(!exact_names(t->ns,fixed,5,31U)||!state_tx_equal(old,next)||!state_ids_equal(old,next)||strcmp(next->phase,"CLEANING")||!strcmp(old->cleanup_nonce,old->create_nonce))return 0;int old_phase=phase_index(old->phase);if(old_phase!=6&&old_phase!=7)return 0;Receipt last;int has_last=0;if(!valid_predecessor(t,old,&last,&has_last)||!validate_quarantine_progress(t,old))return 0;int ordinary=old_phase==6&&!strcmp(old->cleanup_nonce,next->cleanup_nonce);if(ordinary)return 1;if(!strcmp(old->cleanup_nonce,next->cleanup_nonce)||!strcmp(next->cleanup_nonce,old->create_nonce))return 0;if(has_last==1&&(!strcmp(next->cleanup_nonce,last.create_nonce)||!strcmp(next->cleanup_nonce,last.cleanup_nonce)))return 0;return 1;
}
static int valid_state_transition(const State*a,const State*b){
  if(!state_tx_equal(a,b))return 0;int old=phase_index(a->phase),next=phase_index(b->phase);if(old<0||next<0)return 0;
  if(old==0&&next==1)return !*a->cleanup_nonce&&!*b->cleanup_nonce&&!a->object_dev&&!a->object_ino&&b->object_dev&&b->object_ino&&!b->runtime_dev&&!b->runtime_ino&&!b->fifo_dev&&!b->fifo_ino&&!b->portal_dev&&!b->portal_ino&&!b->socket_dev&&!b->socket_ino;
  if(old==1&&next==2)return !*a->cleanup_nonce&&!*b->cleanup_nonce&&a->object_dev==b->object_dev&&a->object_ino==b->object_ino&&!a->runtime_dev&&!a->runtime_ino&&!a->fifo_dev&&!a->fifo_ino&&!a->portal_dev&&!a->portal_ino&&!a->socket_dev&&!a->socket_ino&&b->runtime_dev&&b->runtime_ino&&b->fifo_dev&&b->fifo_ino&&b->portal_dev&&b->portal_ino&&!b->socket_dev&&!b->socket_ino;
  if(old==2&&next==3)return !*a->cleanup_nonce&&!*b->cleanup_nonce&&state_ids_equal(a,b);
  if(old==3&&next==4)return !*a->cleanup_nonce&&!*b->cleanup_nonce&&a->object_dev==b->object_dev&&a->object_ino==b->object_ino&&a->runtime_dev==b->runtime_dev&&a->runtime_ino==b->runtime_ino&&a->fifo_dev==b->fifo_dev&&a->fifo_ino==b->fifo_ino&&a->portal_dev==b->portal_dev&&a->portal_ino==b->portal_ino&&!a->socket_dev&&!a->socket_ino&&b->socket_dev&&b->socket_ino;
  if(old==4&&next==5)return !*a->cleanup_nonce&&!*b->cleanup_nonce&&state_ids_equal(a,b);
  if(old>=3&&old<=5&&next==6)return !*a->cleanup_nonce&&lower_hex(b->cleanup_nonce,64)&&state_ids_equal(a,b);
  return 0;
}
static int phase_index(const char*p){const char*v[]={"RESERVING","CREATING","PUBLISHING","PREPARING","PREPARED","ACTIVE","QUARANTINING","CLEANING"};for(int i=0;i<8;i++)if(!strcmp(p,v[i]))return i;return -1;}
static int capability_matches(const char*expected,const char*capability);
static int reconcile_state_temp(Store*t,const Request*r,int operation,RecoveryContinuation*continuation){
  unsigned char*tmp=NULL,*cur=NULL,*receipt_tmp=NULL,*promoted=NULL;size_t tn=0,cn=0,rn=0,pn=0;struct stat temp_id,current_id,promoted_id;memset(continuation,0,sizeof *continuation);int has_tmp=read_named(t->s,".current.tmp",&tmp,&tn,&temp_id);if(has_tmp<0)return 0;if(has_tmp==0)return 1;int has_receipt_tmp=read_named(t->r,".last.tmp",&receipt_tmp,&rn,&current_id);free(receipt_tmp);if(has_receipt_tmp!=0){free(tmp);return 0;}State next,old,confirmed;if(!parse_state_raw(tmp,tn,&next)){free(tmp);return 0;}int has_cur=read_named(t->s,"current",&cur,&cn,&current_id);if(has_cur<0){free(tmp);return 0;}if(has_cur==0){int ok=!strcmp(next.phase,"RESERVING")&&exact_names(t->s,(const char*const[]){"lock",".current.tmp"},2,3U)&&publish_temp(t->s,".current.tmp","current",1);free(tmp);return ok;}
  int parsed=parse_state_raw(cur,cn,&old);if(!parsed){free(cur);free(tmp);return 0;}int cleanup_transition=(!strcmp(old.phase,"QUARANTINING")||!strcmp(old.phase,"CLEANING"))&&!strcmp(next.phase,"CLEANING");int ok=exact_names(t->s,(const char*const[]){"lock","current",".current.tmp"},3,7U)&&(cleanup_transition?valid_cleanup_reconciliation(t,&old,&next):valid_state_transition(&old,&next));if(!ok||!publish_temp(t->s,".current.tmp","current",0)){free(cur);free(tmp);return 0;}
  int reread=read_named(t->s,"current",&promoted,&pn,&promoted_id),tmp_absent=fstatat(t->s,".current.tmp",&current_id,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH);ok=reread==1&&tmp_absent<0&&errno==ENOENT&&pn==tn&&!memcmp(promoted,tmp,tn)&&same_regular_identity(&temp_id,&promoted_id)&&parse_state_raw(promoted,pn,&confirmed)&&state_tx_equal(&confirmed,&next)&&state_ids_equal(&confirmed,&next)&&!strcmp(confirmed.phase,next.phase)&&!strcmp(confirmed.cleanup_nonce,next.cleanup_nonce)&&exact_names(t->s,(const char*const[]){"lock","current"},2,3U);if(ok&&cleanup_transition&&operation==2&&!strcmp(r->operation,"cleanup-v1")&&!strcmp(r->nonce,next.cleanup_nonce)&&capability_matches(next.cap,r->capability)){continuation->valid=1;strcpy(continuation->operation,"cleanup-v1");strcpy(continuation->nonce,next.cleanup_nonce);strcpy(continuation->capability_sha256,next.cap);digest(tmp,tn,continuation->current_sha256);continuation->current_length=tn;}free(promoted);free(cur);free(tmp);return ok;
}
static int nonce_replayed(Store*t,const State*current,const char*nonce){if(current&&(!strcmp(nonce,current->create_nonce)||(*current->cleanup_nonce&&!strcmp(nonce,current->cleanup_nonce))))return 1;Receipt last;int p=last_present(t,&last,NULL,NULL);return p<0?-1:p==1&&(!strcmp(nonce,last.create_nonce)||!strcmp(nonce,last.cleanup_nonce));}
static int capability_matches(const char*expected,const char*capability){unsigned char raw[32];char sum[65];if(!hex_bytes(capability,raw,sizeof raw))return 0;digest(raw,sizeof raw,sum);return !strcmp(sum,expected);}
static int current_capability(const State*s,const char*capability){return capability_matches(s->cap,capability);}
static int continuation_matches(const RecoveryContinuation*c,const State*s,const Request*r){char raw[4096],sum[65];int n=state_bytes(s,raw,sizeof raw);if(!c||!c->valid||strcmp(c->operation,"cleanup-v1")||strcmp(c->nonce,r->nonce)||strcmp(c->nonce,s->cleanup_nonce)||strcmp(c->capability_sha256,s->cap)||!capability_matches(c->capability_sha256,r->capability)||n<=0||(size_t)n!=c->current_length)return 0;digest(raw,(size_t)n,sum);return !strcmp(sum,c->current_sha256);}

static int recover_with_create(Store*t,State*s,const Request*r,const char **reason){
  if(!strcmp(s->phase,"RESERVING")||!strcmp(s->phase,"CREATING")){if(!remove_prepublication(t,s,reason))return 0;*reason="RECOVERED_RETRY";return 1;}
  if(!strcmp(s->phase,"QUARANTINING")||!strcmp(s->phase,"CLEANING")){*reason="CAPACITY";return 1;}
  if(strcmp(s->phase,"PUBLISHING")&&strcmp(s->phase,"PREPARING")&&strcmp(s->phase,"PREPARED")&&strcmp(s->phase,"ACTIVE")){*reason="INCOMPLETE_IDENTITY";return 0;}
  int reader=-1,eof=fifo_eof_for(t,s,&reader,reason);if(eof==0){*reason="CAPACITY";return 1;}if(eof<0)return 0;strcpy(s->cleanup_nonce,r->nonce);if(!quarantine(t,s,reason)){if(reader>=0)close(reader);return 0;}char receipt[65];int ok=finish_cleanup(t,s,&reader,reason,receipt);if(reader>=0)close(reader);if(ok)*reason="RECOVERED_RETRY";return ok;
}
static int recover_terminal_create(Store*t,const Request*r){
  Receipt terminal;
  unsigned char*raw=NULL;
  size_t n=0;
  int found=validated_terminal_receipt(t,&terminal,&raw,&n);
  free(raw);
  if(found<=0)return found;
  Receipt last;
  int has_last=last_present(t,&last,NULL,NULL);
  if(has_last<0)return -1;
  if(!strcmp(r->nonce,terminal.create_nonce)||!strcmp(r->nonce,terminal.cleanup_nonce)||
      (has_last==1&&(!strcmp(r->nonce,last.create_nonce)||!strcmp(r->nonce,last.cleanup_nonce)))){
    error_frame(0,r->nonce,"REPLAY");
    return 2;
  }
  if(!publish_temp(t->r,".last.tmp","last",has_last==0))return -1;
  error_frame(0,r->nonce,"RECOVERED_RETRY");
  return 2;
}
static int recover_terminal_cleanup(Store*t,const Request*r,int *handled){
  Receipt terminal;unsigned char*raw=NULL;size_t n=0;int found=validated_terminal_receipt(t,&terminal,&raw,&n);if(found==0){*handled=0;return 1;}*handled=1;if(found<0)return 1;Receipt last;int has_last=last_present(t,&last,NULL,NULL);if(has_last<0){free(raw);return 1;}if(!strcmp(r->nonce,terminal.create_nonce)||(has_last==1&&(!strcmp(r->nonce,last.create_nonce)||!strcmp(r->nonce,last.cleanup_nonce)))){free(raw);error_frame(0,r->nonce,"REPLAY");return 1;}if(!capability_matches(terminal.cap,r->capability)){free(raw);error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}if(strcmp(r->nonce,terminal.cleanup_nonce)){free(raw);error_frame(0,r->nonce,"CAPACITY");return 1;}char receipt[65];digest(raw,n,receipt);free(raw);if(!publish_temp(t->r,".last.tmp","last",has_last==0))return 1;char body[512];snprintf(body,sizeof body,"{\"operation\":\"cleanup-result-v1\",\"receipt_sha256\":\"%s\",\"request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1}",receipt,r->nonce,terminal.runtime);return json_frame(0,body)?0:1;
}
static int process_create(Store*t,const Request*r){
  State current;int present=state_present(t,&current);if(present<0)return 1;if(!present){int terminal=recover_terminal_create(t,r);if(terminal<0)return 1;if(terminal==2)return 1;if(!validate_idle_store(t))return 1;}if(present&&!validate_store_shape(t,&current,NULL))return 1;int replay=nonce_replayed(t,present?&current:NULL,r->nonce);if(replay<0)return 1;if(replay)return error_frame(0,r->nonce,"REPLAY")?1:1;
  if(present){const char*reason="INCOMPLETE_IDENTITY";int recovered=recover_with_create(t,&current,r,&reason);error_frame(0,r->nonce,recovered?reason:reason);return 1;}
  return create_runtime_object(t,r)?0:1;
}
static int process_cleanup(Store*t,const Request*r,RecoveryContinuation*continuation){
  State current;int present=state_present(t,&current);if(present<0)return 1;if(!present){memset(continuation,0,sizeof *continuation);int handled=0,rc=recover_terminal_cleanup(t,r,&handled);if(handled)return rc;if(!validate_idle_store(t))return 1;int replay=nonce_replayed(t,NULL,r->nonce);if(replay<0)return 1;if(replay){error_frame(0,r->nonce,"REPLAY");return 1;}error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}int receipt_temp_present=0;if(!validate_store_shape(t,&current,&receipt_temp_present)){memset(continuation,0,sizeof *continuation);return 1;}int recovery_continuation=continuation_matches(continuation,&current,r);memset(continuation,0,sizeof *continuation);int temp_continuation=receipt_temp_present&&!strcmp(current.cleanup_nonce,r->nonce);if(recovery_continuation&&receipt_temp_present)return 1;if(!temp_continuation&&!recovery_continuation){int replay=nonce_replayed(t,&current,r->nonce);if(replay<0)return 1;if(replay){error_frame(0,r->nonce,"REPLAY");return 1;}}if(!current_capability(&current,r->capability)){error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}if(receipt_temp_present&&!temp_continuation){error_frame(0,r->nonce,"CAPACITY");return 1;}if(strcmp(current.phase,"ACTIVE")&&strcmp(current.phase,"QUARANTINING")&&strcmp(current.phase,"CLEANING")){error_frame(0,r->nonce,"INVALID_CAPABILITY");return 1;}
  const char*reason="INCOMPLETE_IDENTITY";int reader=-1,eof=fifo_eof_for(t,&current,&reader,&reason);if(eof==0){error_frame(0,r->nonce,"LEASE_LIVE");return 1;}if(eof<0){error_frame(0,r->nonce,reason);return 1;}if(!receipt_temp_present&&!recovery_continuation){strcpy(current.cleanup_nonce,r->nonce);if(!strcmp(current.phase,"CLEANING")){if(!put_state(t,&current,0)){if(reader>=0)close(reader);error_frame(0,r->nonce,"INCOMPLETE_IDENTITY");return 1;}}else if(!quarantine(t,&current,&reason)){if(reader>=0)close(reader);error_frame(0,r->nonce,reason);return 1;}}
  char receipt[65];if(!finish_cleanup(t,&current,&reader,&reason,receipt)){if(reader>=0)close(reader);error_frame(0,r->nonce,reason);return 1;}if(reader>=0)close(reader);char body[512];snprintf(body,sizeof body,"{\"operation\":\"cleanup-result-v1\",\"receipt_sha256\":\"%s\",\"request_nonce\":\"%s\",\"runtime_id\":\"%s\",\"schema_version\":1}",receipt,r->nonce,current.runtime);return json_frame(0,body)?0:1;
}
static int request_semantics(const Request*r,const char**reason){
  if(!r->has_nonce||!lower_hex(r->nonce,64))return 0;if(!r->has_operation){*reason="INVALID_OPERATION";return -1;}if(strcmp(r->operation,"create-v1")&&strcmp(r->operation,"cleanup-v1")){*reason="INVALID_OPERATION";return -1;}
  if(!strcmp(r->operation,"create-v1")){if(r->keys!=3||!r->has_nonce||!r->has_schema||!r->schema_one||r->has_capability){*reason="INVALID_KEYS";return -1;}return 1;}
  if(r->keys!=4||!r->has_nonce||!r->has_schema||!r->schema_one||!r->has_capability){*reason="INVALID_KEYS";return -1;}if(!lower_hex(r->capability,64)){*reason="INVALID_CAPABILITY";return -1;}return 2;
}
static int mediator_boundary(void){
  if(getuid()!=CLIENT_UID||getgid()!=CLIENT_GID||geteuid()!=0||getegid()!=CLIENT_GID)return 0;struct stat s;if(fstat(0,&s)||!S_ISSOCK(s.st_mode))return 0;int type=0;socklen_t tn=sizeof type;if(getsockopt(0,SOL_SOCKET,SO_TYPE,&type,&tn)||type!=SOCK_STREAM)return 0;struct sockaddr_un peer;socklen_t pn=sizeof peer;if(getpeername(0,(struct sockaddr*)&peer,&pn)||peer.sun_family!=AF_UNIX)return 0;uid_t uid=(uid_t)-1;gid_t gid=(gid_t)-1;if(getpeereid(0,&uid,&gid)||uid!=CLIENT_UID||gid!=CLIENT_GID)return 0;int one=1;struct timeval timeout={5,0};return setsockopt(0,SOL_SOCKET,SO_NOSIGPIPE,&one,sizeof one)==0&&setsockopt(0,SOL_SOCKET,SO_SNDTIMEO,&timeout,sizeof timeout)==0;
}
static int close_inherited(void){
  int bytes=proc_pidinfo(getpid(),PROC_PIDLISTFDS,0,NULL,0);if(bytes<0||bytes>(int)(sizeof(struct proc_fdinfo)*1048576U))return 0;size_t cap=(size_t)bytes+sizeof(struct proc_fdinfo)*16U;struct proc_fdinfo *list=malloc(cap?cap:sizeof *list);if(!list)return 0;int got=proc_pidinfo(getpid(),PROC_PIDLISTFDS,0,list,(int)cap);if(got<0||got%(int)sizeof *list){free(list);return 0;}size_t count=(size_t)got/sizeof *list;for(size_t i=0;i<count;i++)if(list[i].proc_fd!=0&&close(list[i].proc_fd)){free(list);return 0;}free(list);
  bytes=proc_pidinfo(getpid(),PROC_PIDLISTFDS,0,NULL,0);if(bytes<0||bytes>(int)(sizeof(struct proc_fdinfo)*16U))return 0;cap=(size_t)bytes+sizeof(struct proc_fdinfo)*4U;list=malloc(cap?cap:sizeof *list);if(!list)return 0;got=proc_pidinfo(getpid(),PROC_PIDLISTFDS,0,list,(int)cap);if(got<0||got%(int)sizeof *list){free(list);return 0;}count=(size_t)got/sizeof *list;int only_zero=1;for(size_t i=0;i<count;i++)if(list[i].proc_fd!=0)only_zero=0;free(list);return only_zero;
}
static int mediator_main(int argc,char **argv){
  if(argc!=1||!argv||!argv[0]||!mediator_boundary())return 1;static char*empty[]={NULL};environ=empty;if(chdir("/")||!close_inherited())return 1;umask(077);unsigned char*raw=NULL;size_t n=0;if(!receive_frame(0,&raw,&n))return 1;Request request;int parsed=parse_request(raw,n,&request);free(raw);if(!parsed)return 1;const char*semantic_reason="INVALID_KEYS";int operation=request_semantics(&request,&semantic_reason);if(!operation)return 1;if(operation<0){error_frame(0,request.nonce,semantic_reason);return 1;}
  Store store;RecoveryContinuation continuation;memset(&continuation,0,sizeof continuation);if(!open_store(&store)){close_store(&store);return 1;}if(!acquire_lock(store.lock)){int saved=errno;error_frame(0,request.nonce,(saved==EAGAIN||saved==EACCES)?"LOCK_BUSY":"UNSUPPORTED_PRIMITIVE");close_store(&store);return 1;}if(!reconcile_state_temp(&store,&request,operation,&continuation)){close_store(&store);return 1;}int rc=operation==1?process_create(&store,&request):process_cleanup(&store,&request,&continuation);memset(&continuation,0,sizeof continuation);close_store(&store);return rc;
}
#endif

#ifdef H039_INSTALLER
#define Q1(x) #x
#define Q(x) Q1(x)

static int canonical_absolute(const char *p){
  if(!p)return 0;
  size_t length=strlen(p);
  if(length<sizeof("/install")-1||p[0]!='/'||p[length-1]=='/')return 0;
  if(!strcmp(p+length-2,"/.")||!strcmp(p+length-3,"/.."))return 0;
  if(strstr(p,"/./")!=NULL||strstr(p,"/../")!=NULL)return 0;
  return strstr(p,"//")==NULL;
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
static int load_source(int project,uid_t uid,gid_t gid,mode_t mode,dev_t device,unsigned char **raw,size_t *length,struct stat *identity){
  int fd=stable_named_fd(project,"verify/h039/runtime-cleanup-mediator",O_RDONLY,uid,gid,mode,4194304,raw,length,identity);if(fd<0)return errno==ENOENT?0:-1;if(identity->st_dev!=device||!*length){close(fd);free(*raw);*raw=NULL;return -1;}int ok=close(fd)==0;char sum[65];if(ok)digest(*raw,*length,sum);if(!ok||strcmp(sum,Q(H039_MEDIATOR_SHA256))){free(*raw);*raw=NULL;return -1;}return 1;
}
static int load_embedded_mediator(unsigned char **raw,size_t *length){
  unsigned long section_size=0;uint8_t *section=getsectiondata(&_mh_execute_header,"__H039RO","__h039med",&section_size);if(!section||section_size!=(unsigned long)H039_MEDIATOR_SIZE||section_size==0)return 0;char sum[65];digest(section,(size_t)section_size,sum);if(strcmp(sum,Q(H039_MEDIATOR_SHA256)))return 0;unsigned char *copy=malloc((size_t)section_size);if(!copy)return 0;memcpy(copy,section,(size_t)section_size);*raw=copy;*length=(size_t)section_size;return 1;
}
static int durable_fixed_dir_at(int parent,const char*name,uid_t uid,gid_t gid,mode_t mode){
  int fd=fixed_dir_at(parent,name,uid,gid,mode);struct stat before,after,rebound;int ok=fd>=0;if(ok)ok=!fstat(fd,&before)&&!fsync(fd)&&flush_dir(parent)&&!fstat(fd,&after)&&same_stat(&before,&after)&&!fstatat(parent,name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);if(!ok&&fd>=0){close(fd);fd=-1;}return fd;
}
static int validate_staging(int project,const struct stat*self,const struct stat*source){
  uid_t uid=getuid();gid_t gid=(gid_t)-1;struct stat project_stat;if(fstat(project,&project_stat)||!S_ISDIR(project_stat.st_mode)||project_stat.st_uid!=uid||(project_stat.st_mode&07777)!=0700)return 0;
  const char*project_names[]={"controller","verify"},*controller_names[]={"runtime-cleanup"},*runtime_names[]={"install"},*verify_names[]={"h039"},*h039_names[]={"runtime-cleanup-mediator"};if(!exact_names(project,project_names,2,3U))return 0;
  int controller=fixed_dir_at(project,"controller",uid,gid,0755),verify=fixed_dir_at(project,"verify",uid,gid,0755),runtime=-1,h039=-1,self_fd=-1,source_fd=-1;int ok=controller>=0&&verify>=0;if(ok){runtime=fixed_dir_at(controller,"runtime-cleanup",uid,gid,0755);h039=fixed_dir_at(verify,"h039",uid,gid,0755);ok=runtime>=0&&h039>=0;}struct stat self_named,source_named;if(ok)ok=exact_names(controller,controller_names,1,1U)&&exact_names(runtime,runtime_names,1,1U)&&exact_names(verify,verify_names,1,1U)&&exact_names(h039,h039_names,1,1U);if(ok){self_fd=stable_named_fd(runtime,"install",O_RDONLY,uid,gid,0755,4194304,NULL,NULL,&self_named);source_fd=stable_named_fd(h039,"runtime-cleanup-mediator",O_RDONLY,uid,gid,0555,4194304,NULL,NULL,&source_named);ok=self_fd>=0&&source_fd>=0&&same_stat(self,&self_named)&&same_stat(source,&source_named);}if(self_fd>=0&&close(self_fd))ok=0;if(source_fd>=0&&close(source_fd))ok=0;if(runtime>=0&&close(runtime))ok=0;if(h039>=0&&close(h039))ok=0;if(controller>=0&&close(controller))ok=0;if(verify>=0&&close(verify))ok=0;return ok;
}
static int validate_bootstrap_staging(int project,const struct stat*self){
  struct stat project_before,project_after;if(fstat(project,&project_before)||!S_ISDIR(project_before.st_mode)||project_before.st_uid||project_before.st_gid||(project_before.st_mode&07777)!=0700||fsync(project)||fstat(project,&project_after)||!same_stat(&project_before,&project_after))return 0;const char*project_names[]={"controller","mediator"},*controller_names[]={"runtime-cleanup"},*runtime_names[]={"install"};if(!exact_names(project,project_names,2,1U))return 0;int controller=durable_fixed_dir_at(project,"controller",0,0,0700),runtime=-1,self_fd=-1;int ok=controller>=0;if(ok){runtime=durable_fixed_dir_at(controller,"runtime-cleanup",0,0,0700);ok=runtime>=0&&exact_names(controller,controller_names,1,1U)&&exact_names(runtime,runtime_names,1,1U);}struct stat named,after,rebound;if(ok){self_fd=stable_named_fd(runtime,"install",O_RDONLY,0,0,0500,4194304,NULL,NULL,&named);ok=self_fd>=0&&same_stat(self,&named)&&!fsync(self_fd)&&flush_dir(runtime)&&!fstat(self_fd,&after)&&same_stat(&named,&after)&&!fstatat(runtime,"install",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);}if(self_fd>=0&&close(self_fd))ok=0;if(runtime>=0&&close(runtime))ok=0;if(controller>=0&&close(controller))ok=0;return ok;
}
static int exact_regular_bytes(int parent,const char*name,mode_t mode,const unsigned char*raw,size_t n,struct stat*identity,int*opened){
  unsigned char*first=NULL,*second=NULL;size_t first_n=0,second_n=0;struct stat before,after,rebound;int fd=stable_named_fd(parent,name,O_RDONLY,0,0,mode,4194304,&first,&first_n,&before);int ok=fd>=0&&first_n==n&&!memcmp(first,raw,n)&&!fsync(fd)&&flush_dir(parent)&&stable_read_fd(fd,4194304,&second,&second_n,&after)&&same_stat(&before,&after)&&second_n==n&&!memcmp(second,raw,n)&&!fstatat(parent,name,&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);free(first);free(second);if(!ok){if(fd>=0)close(fd);return 0;}if(identity)*identity=after;if(opened)*opened=fd;else if(close(fd))return 0;return 1;
}
static int same_rename_identity(const struct stat*a,const struct stat*b){return a->st_dev==b->st_dev&&a->st_ino==b->st_ino&&a->st_mode==b->st_mode&&a->st_uid==b->st_uid&&a->st_gid==b->st_gid&&a->st_nlink==b->st_nlink&&a->st_size==b->st_size;}
static int make_final_directory(int parent,const char*name){
  int existing=durable_fixed_dir_at(parent,name,0,0,0555);if(existing>=0){int ok=close(existing)==0;return ok;}if(errno!=ENOENT)return 0;mode_t previous=umask(0);if(previous!=077){umask(previous);return 0;}int made=mkdirat(parent,name,0555);mode_t during=umask(077);if(made||during!=0)return 0;int fd=durable_fixed_dir_at(parent,name,0,0,0555);int ok=fd>=0;if(fd>=0&&close(fd))ok=0;return ok;
}
static int ensure_lock(int state){struct stat identity,after,rebound;int fd=stable_named_fd(state,"lock",O_RDWR,0,0,0600,0,NULL,NULL,&identity);if(fd>=0){int ok=identity.st_size==0&&!fsync(fd)&&flush_dir(state)&&!fstat(fd,&after)&&same_stat(&identity,&after)&&!fstatat(state,"lock",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);if(close(fd))ok=0;return ok;}if(errno!=ENOENT)return 0;fd=openat(state,"lock",O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0600);int ok=fd>=0&&!fchown(fd,0,0)&&!fchmod(fd,0600)&&!fsync(fd)&&!fstat(fd,&identity)&&identity.st_size==0&&S_ISREG(identity.st_mode)&&identity.st_uid==0&&identity.st_gid==0&&(identity.st_mode&07777)==0600&&identity.st_nlink==1&&!fstatat(state,"lock",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&identity,&rebound)&&flush_dir(state)&&!fstat(fd,&after)&&same_stat(&identity,&after)&&!fstatat(state,"lock",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);if(fd>=0&&close(fd))ok=0;return ok;}
static int stage_embedded_mediator(int project,const unsigned char*raw,size_t n){
  struct stat named;if(fstatat(project,"mediator",&named,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){mode_t mode=named.st_mode&07777;if(mode!=0400&&mode!=04555)return 0;unsigned char*first=NULL,*second=NULL;size_t first_n=0,second_n=0;struct stat before,after,rebound;int fd=stable_named_fd(project,"mediator",O_RDONLY,0,0,mode,4194304,&first,&first_n,&before);int ok=fd>=0&&first_n<=n&&!memcmp(first,raw,first_n)&&!fsync(fd)&&flush_dir(project)&&stable_read_fd(fd,4194304,&second,&second_n,&after)&&same_stat(&before,&after)&&second_n==first_n&&!memcmp(second,raw,second_n)&&!fstatat(project,"mediator",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&after,&rebound);free(first);free(second);if(!ok){if(fd>=0)close(fd);return 0;}if(mode==04555){ok=first_n==n&&close(fd)==0;return ok;}if(first_n<n){if(close(fd)||unlinkat(project,"mediator",AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_UNIQUE)||!flush_dir(project))return 0;}else{struct stat ready;if(fchmod(fd,04555)||fsync(fd)||flush_dir(project)||fstat(fd,&ready)||!S_ISREG(ready.st_mode)||ready.st_uid||ready.st_gid||(ready.st_mode&07777)!=04555||ready.st_nlink!=1||ready.st_size!=(off_t)n||fstatat(project,"mediator",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&ready,&rebound)){close(fd);return 0;}return close(fd)==0;}}
  else if(errno!=ENOENT)return 0;
  int fd=openat(project,"mediator",O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW_ANY|O_UNIQUE,0400);if(fd<0)return 0;unsigned char*reloaded=NULL;size_t reloaded_n=0;struct stat durable,ready,rebound;int ok=!fchown(fd,0,0)&&!fchmod(fd,0400)&&write_all(fd,raw,n)&&!fsync(fd)&&stable_read_fd(fd,4194304,&reloaded,&reloaded_n,&durable)&&reloaded_n==n&&!memcmp(reloaded,raw,n)&&durable.st_uid==0&&durable.st_gid==0&&(durable.st_mode&07777)==0400&&durable.st_nlink==1&&!fstatat(project,"mediator",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&durable,&rebound);free(reloaded);if(ok)ok=!fchmod(fd,04555)&&!fsync(fd)&&flush_dir(project)&&!fstat(fd,&ready)&&(ready.st_mode&07777)==04555&&ready.st_dev==durable.st_dev&&ready.st_ino==durable.st_ino&&ready.st_uid==0&&ready.st_gid==0&&ready.st_nlink==1&&ready.st_size==(off_t)n&&!fstatat(project,"mediator",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&ready,&rebound);if(close(fd))ok=0;return ok;
}
static int installed_mediator_status(int helpers,const unsigned char*raw,size_t n){struct stat named;if(fstatat(helpers,"se.nortropic.runtime-cleanup-mediator",&named,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)){return errno==ENOENT?0:-1;}return exact_regular_bytes(helpers,"se.nortropic.runtime-cleanup-mediator",04555,raw,n,NULL,NULL)?1:-1;}
static int publish_staged_mediator(int project,int helpers,const unsigned char*raw,size_t n){
  int installed=installed_mediator_status(helpers,raw,n);if(installed<0)return 0;if(installed==1){struct stat staged;if(fstatat(project,"mediator",&staged,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0||errno!=ENOENT)return 0;if(!flush_dir(project)||fstatat(project,"mediator",&staged,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0||errno!=ENOENT)return 0;return installed_mediator_status(helpers,raw,n)==1;}struct stat staged,project_stat,helpers_stat;int fd=-1;if(!exact_regular_bytes(project,"mediator",04555,raw,n,&staged,&fd)||fstat(project,&project_stat)||fstat(helpers,&helpers_stat)||staged.st_dev!=project_stat.st_dev||staged.st_dev!=helpers_stat.st_dev){if(fd>=0)close(fd);return 0;}int flags=RENAME_EXCL|RENAME_NOFOLLOW_ANY|RENAME_RESOLVE_BENEATH;int ok=!renameatx_np(project,"mediator",helpers,"se.nortropic.runtime-cleanup-mediator",flags)&&flush_dir(project)&&flush_dir(helpers);struct stat retained,published;if(ok)ok=!fstat(fd,&retained)&&same_rename_identity(&staged,&retained)&&!fstatat(helpers,"se.nortropic.runtime-cleanup-mediator",&published,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)&&same_stat(&retained,&published)&&installed_mediator_status(helpers,raw,n)==1;if(close(fd))ok=0;return ok;
}
static int directory_prefix(int ns,int *prefix,int *has_lock){
  const char*dirs[]={"a","c","q","r","s"};int count=0,missing=0,lock=0;for(size_t i=0;i<5;i++){int fd=durable_fixed_dir_at(ns,dirs[i],0,0,0555);if(fd<0){if(errno!=ENOENT)return 0;missing=1;continue;}if(missing){close(fd);return 0;}count++;if(i<4){if(!exact_empty(fd)){close(fd);return 0;}}else{const char*names[]={"lock"};if(!exact_names(fd,names,1,0)){close(fd);return 0;}struct stat value;if(fstatat(fd,"lock",&value,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0){int lock_fd=stable_named_fd(fd,"lock",O_RDWR,0,0,0600,0,NULL,NULL,&value);struct stat after,rebound;if(lock_fd<0||value.st_size!=0||fsync(lock_fd)||flush_dir(fd)||fstat(lock_fd,&after)||!same_stat(&value,&after)||fstatat(fd,"lock",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&after,&rebound)){if(lock_fd>=0)close(lock_fd);close(fd);return 0;}lock=close(lock_fd)==0;}else if(errno!=ENOENT){close(fd);return 0;}}if(close(fd))return 0;}if(count<5&&lock)return 0;*prefix=count;*has_lock=lock;return 1;
}
static int remove_fixed_staging(int project){
  unsigned leaf=AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH|AT_UNIQUE,dir_flags=AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH;const char*project_names[]={"controller"},*controller_names[]={"runtime-cleanup"},*runtime_names[]={"install"};if(!exact_names(project,project_names,1,1U))return 0;int controller=durable_fixed_dir_at(project,"controller",0,0,0700),runtime=-1,self=-1;if(controller<0)goto fail;runtime=durable_fixed_dir_at(controller,"runtime-cleanup",0,0,0700);if(runtime<0||!exact_names(controller,controller_names,1,1U)||!exact_names(runtime,runtime_names,1,1U))goto fail;struct stat identity,after,rebound;self=stable_named_fd(runtime,"install",O_RDONLY,0,0,0500,4194304,NULL,NULL,&identity);if(self<0||fsync(self)||flush_dir(runtime)||fstat(self,&after)||!same_stat(&identity,&after)||fstatat(runtime,"install",&rebound,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&after,&rebound))goto fail;if(close(self))goto fail;self=-1;if(unlinkat(runtime,"install",leaf)||!flush_dir(runtime)||close(runtime))goto fail;runtime=-1;if(unlinkat(controller,"runtime-cleanup",dir_flags)||!flush_dir(controller)||close(controller))goto fail;controller=-1;if(unlinkat(project,"controller",dir_flags)||!flush_dir(project))goto fail;return exact_empty(project);
fail:if(self>=0)close(self);if(runtime>=0)close(runtime);if(controller>=0)close(controller);return 0;
}
static int apply_install(int project,const unsigned char *mediator,size_t mediator_n){
  int ns=open(NS,O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY),db=-1;struct stat nss,named_ns,project_stat,staging_stat,after;if(ns<0||fstat(ns,&nss)||!S_ISDIR(nss.st_mode)||nss.st_uid||nss.st_gid||((nss.st_mode&07777)!=0700&&(nss.st_mode&07777)!=0555)){if(ns>=0)close(ns);return 0;}db=parent_dir(ns,0,0,0755);if(db<0||fsync(ns)||flush_dir(db)||fstat(ns,&after)||!same_stat(&nss,&after)||fstatat(db,"nortropic-runtime-cleanup-v1",&named_ns,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&after,&named_ns)||lstat(NS,&named_ns)||!same_stat(&after,&named_ns)||fstat(project,&project_stat)||fstatat(ns,".install",&staging_stat,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&project_stat,&staging_stat)||fsync(project)||fsync(ns)||fstat(project,&after)||!same_stat(&project_stat,&after)||fstatat(ns,".install",&staging_stat,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&after,&staging_stat)){if(db>=0)close(db);close(ns);return 0;}int finalizing=(nss.st_mode&07777)==0555;const char*namespace_names[]={".install","a","c","q","r","s"};if(!exact_names(ns,namespace_names,6,1U)){close(db);close(ns);return 0;}int prefix=0,has_lock=0;if(!directory_prefix(ns,&prefix,&has_lock)){close(db);close(ns);return 0;}
  int helpers=open("/Library/PrivilegedHelperTools",O_RDONLY|O_DIRECTORY|O_CLOEXEC|O_NOFOLLOW_ANY);struct stat hs,hs_after;if(helpers<0||fstat(helpers,&hs)||!S_ISDIR(hs.st_mode)||hs.st_uid||hs.st_gid||(hs.st_mode&0022)||fsync(helpers)||fstat(helpers,&hs_after)||!same_stat(&hs,&hs_after)){if(helpers>=0)close(helpers);close(db);close(ns);return 0;}int installed=installed_mediator_status(helpers,mediator,mediator_n);if(installed<0){close(helpers);close(db);close(ns);return 0;}struct stat staged;int staged_present=fstatat(project,"mediator",&staged,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)==0;if(!staged_present&&errno!=ENOENT){close(helpers);close(db);close(ns);return 0;}
  int ok=1;if(finalizing){ok=installed==1&&prefix==5&&has_lock&&!staged_present;}else if(installed==1){ok=prefix==5&&has_lock&&!staged_present;}else{if(prefix>0&&(!staged_present||(staged.st_mode&07777)!=04555))ok=0;if(ok)ok=stage_embedded_mediator(project,mediator,mediator_n);const char*dirs[]={"a","c","q","r","s"};for(int i=prefix;ok&&i<5;i++)ok=make_final_directory(ns,dirs[i]);int state=ok?durable_fixed_dir_at(ns,"s",0,0,0555):-1;if(ok)ok=state>=0&&ensure_lock(state);if(state>=0&&close(state))ok=0;if(ok)ok=publish_staged_mediator(project,helpers,mediator,mediator_n);}if(!ok){close(helpers);close(db);close(ns);return 0;}
  const char*dirs[]={"a","c","q","r","s"},*lock_name[]={"lock"};int a=durable_fixed_dir_at(ns,"a",0,0,0555),c=durable_fixed_dir_at(ns,"c",0,0,0555),q=durable_fixed_dir_at(ns,"q",0,0,0555),r=durable_fixed_dir_at(ns,"r",0,0,0555),s=durable_fixed_dir_at(ns,"s",0,0,0555);ok=a>=0&&c>=0&&q>=0&&r>=0&&s>=0&&exact_empty(a)&&exact_empty(c)&&exact_empty(q)&&exact_empty(r)&&ensure_lock(s)&&exact_names(s,lock_name,1,1U)&&exact_names(ns,namespace_names,6,63U)&&installed_mediator_status(helpers,mediator,mediator_n)==1;if(a>=0)close(a);if(c>=0)close(c);if(q>=0)close(q);if(r>=0)close(r);if(s>=0)close(s);if(close(helpers))ok=0;if(!ok){close(db);close(ns);return 0;}
  struct stat published_fd,published_name;if(!finalizing&&(fchmod(ns,0555)||fsync(ns)||!flush_dir(db))) {close(db);close(ns);return 0;}if(fstat(ns,&published_fd)||fstatat(db,"nortropic-runtime-cleanup-v1",&published_name,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&published_fd,&published_name)||lstat(NS,&published_name)||!same_stat(&published_fd,&published_name)||!S_ISDIR(published_fd.st_mode)||published_fd.st_uid||published_fd.st_gid||(published_fd.st_mode&07777)!=0555){close(db);close(ns);return 0;}
  if(!remove_fixed_staging(project)||unlinkat(ns,".install",AT_REMOVEDIR|AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!flush_dir(ns)||!flush_dir(db)||!exact_names(ns,dirs,5,31U)||fstat(ns,&published_fd)||fstatat(db,"nortropic-runtime-cleanup-v1",&published_name,AT_SYMLINK_NOFOLLOW_ANY|AT_RESOLVE_BENEATH)||!same_stat(&published_fd,&published_name)||lstat(NS,&published_name)||!same_stat(&published_fd,&published_name)||(published_fd.st_mode&07777)!=0555){close(db);close(ns);return 0;}if(close(db)||close(ns))return 0;return 1;
}
static int installer_verify(const unsigned char*embedded,size_t embedded_n){
  char self_path[4096];struct stat self,source;int self_parent=-1,controller=-1,project=-1;unsigned char*adjacent=NULL;size_t adjacent_n=0;int result=1;if(!loaded_self(self_path,&self,&self_parent)||self.st_uid!=getuid()||(self.st_mode&07777)!=0755||self.st_nlink!=1)goto done;controller=parent_dir(self_parent,getuid(),(gid_t)-1,0755);if(controller<0)goto done;project=parent_dir(controller,getuid(),(gid_t)-1,0700);if(project<0)goto done;int source_status=load_source(project,getuid(),(gid_t)-1,0555,self.st_dev,&adjacent,&adjacent_n,&source);if(source_status!=1||!validate_staging(project,&self,&source)||adjacent_n!=embedded_n||memcmp(adjacent,embedded,embedded_n))goto done;result=0;
done:if(project>=0)close(project);if(controller>=0)close(controller);if(self_parent>=0)close(self_parent);free(adjacent);return result;
}
static int close_bootstrap_descriptors(void){
  const int byte_cap=1048576;pid_t self=getpid();errno=0;int sizing=proc_pidinfo(self,PROC_PIDLISTFDS,0,NULL,0);if(sizing<=0||errno!=0||sizing>byte_cap||sizing%(int)sizeof(struct proc_fdinfo))return 0;struct proc_fdinfo*list=malloc((size_t)byte_cap);if(!list)return 0;errno=0;int got=proc_pidinfo(self,PROC_PIDLISTFDS,0,list,byte_cap);if(got!=2*(int)sizeof *list||errno!=0){free(list);return 0;}int one=0,two=0;for(size_t i=0;i<2;i++){if(list[i].proc_fd==1&&!one)one=1;else if(list[i].proc_fd==2&&!two)two=1;else{free(list);return 0;}}if(!one||!two){free(list);return 0;}if(close(1)!=0){free(list);return 0;}if(close(2)!=0){free(list);return 0;}errno=0;sizing=proc_pidinfo(self,PROC_PIDLISTFDS,0,NULL,0);if(sizing<0||errno!=0||sizing>byte_cap||sizing%(int)sizeof *list){free(list);return 0;}memset(list,0,(size_t)byte_cap);errno=0;got=proc_pidinfo(self,PROC_PIDLISTFDS,0,list,byte_cap);int ok=got==0&&errno==0;free(list);return ok;
}
static int installer_bootstrap(int argc,char **argv){
  if(argc!=2||!argv||!argv[0]||strcmp(argv[1],"bootstrap")||getuid()!=0||geteuid()!=0||getgid()!=0||getegid()!=0)return 1;char initial[4096];uint32_t cap=4096;if(_NSGetExecutablePath(initial,&cap)||!canonical_absolute(initial)||strcmp(initial,NS "/.install/controller/runtime-cleanup/install")||strcmp(argv[0],initial))return 1;static char*empty[]={NULL};environ=empty;if(chdir("/"))return 1;errno=0;if(fcntl(0,F_GETFD)!=-1||errno!=EBADF)return 1;if(!close_bootstrap_descriptors())return 1;umask(077);char self_path[4096];struct stat self;int self_parent=-1,controller=-1,project=-1;unsigned char*mediator=NULL;size_t mediator_n=0;int result=1;if(!loaded_self(self_path,&self,&self_parent)||strcmp(self_path,initial)||self.st_uid!=0||self.st_gid!=0||(self.st_mode&07777)!=0500||self.st_nlink!=1)goto done;if(!load_embedded_mediator(&mediator,&mediator_n))goto done;controller=parent_dir(self_parent,0,0,0700);if(controller<0)goto done;project=parent_dir(controller,0,0,0700);if(project<0||!validate_bootstrap_staging(project,&self))goto done;result=!apply_install(project,mediator,mediator_n);
done:if(project>=0)close(project);if(controller>=0)close(controller);if(self_parent>=0)close(self_parent);free(mediator);return result;
}
static int installer_main(int argc,char **argv){
  if(argc!=2||!argv||!argv[0])return 1;if(!strcmp(argv[1],"verify")){unsigned char*embedded=NULL;size_t embedded_n=0;if(!load_embedded_mediator(&embedded,&embedded_n))return 1;int result=installer_verify(embedded,embedded_n);free(embedded);return result;}if(!strcmp(argv[1],"bootstrap"))return installer_bootstrap(argc,argv);return 1;
}
#endif

int main(int argc,char **argv){
#ifdef H039_INSTALLER
  return installer_main(argc,argv);
#else
  return mediator_main(argc,argv);
#endif
}
