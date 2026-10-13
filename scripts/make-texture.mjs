// A tiny, deterministic grain texture. No image API or runtime rendering required.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
const size=128, pixels=Buffer.alloc(size*(size*4+1));
let seed=1943;
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(seed*1664525+1013904223)>>>0;
  const offset=y*(size*4+1)+1+x*4, shade=(seed>>>17)&1?255:0;
  pixels[offset]=shade;pixels[offset+1]=shade;pixels[offset+2]=shade;pixels[offset+3]=(seed>>>24)%14;
}
function crc(buffer){let value=0xffffffff;for(const byte of buffer){value^=byte;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0);}return(value^0xffffffff)>>>0;}
function chunk(type,data){const label=Buffer.from(type),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([label,data])));return Buffer.concat([length,label,data,checksum]);}
const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
writeFileSync('public/grain.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));
