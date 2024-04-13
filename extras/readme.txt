TSAC Very Low Bitrate Audio Compression
=======================================

TSAC is an audio compression utility reaching very low bitrates such
as 5.5 kb/s for mono or 7.5 kb/s for stereo at 44.1 kHz with a good
perceptual quality. Hence TSAC compresses a 3.5 minute stereo song to
a file of 192 KiB.

TSAC is based on a modified version of the Descript Audio Codec
extended for stereo and a Transformer model to further increase the
compression ratio.

A GPU is necessary for fast operation. CPU only is also supported but
slower.

1) Installation
---------------

In order to get reasonable speed, you need an Nvidia Ampere, ADA or
Hopper GPU (e.g. RTX 3090, RTX 4090, RTX A6000, A100 or H100) with
cuda >= 12.x. At least 4 GB memory should be available on the GPU.

x86 CPUs are supported too but the program is much slower.

The FFmpeg utility is required to convert input files to raw
format.

2) Usage
--------

To compress an audio file, use:

./tsac --cuda c myfile.mp3 myfile.tsac

To decompress it:

./tsac --cuda d myfile.tsac output.wav

Remove the "--cuda" option to use the CPU instead of the GPU.

Use the "-v" option to display statistics.

Use the "-q" option to set the quality and bitrate (from 1 to 12 for
joint stereo otherwise from 1 to 9, the default is the highest value).

Use the "-f" option to get a faster compression and decompression at
the expense of a higher bitrate (the transformer model is disabled).

By default, stereo files are encoded using joint stereo coding in order
to get the highest compression. The "-s" option disables joint stereo
and encodes each channel separately.

The "-c" option can be used to force the number of input channels.

TSAC natively accepts wave (.wav) or raw 16 bit signed little endian
(.sw) files as input. The sample rate must be 44.1 kHz. Up to 127
input channels are supported. FFmpeg is optionally used to convert the
input file format, number of channels and sample rate.

3) License
----------

Copyright (c) 2023-2024 Fabrice Bellard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
