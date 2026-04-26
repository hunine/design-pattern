// RAW: A client that must directly orchestrate a complex video-conversion
// subsystem. It knows about every sub-component, their order of operations,
// and their internal configuration. Any change to the subsystem ripples
// into every piece of client code.

class VideoFile {
  filename: string;
  constructor(filename: string) {
    this.filename = filename;
  }
}

class OggCompressionCodec {
  compress(file: VideoFile): string {
    return `ogg-compressed(${file.filename})`;
  }
}

class MPEG4CompressionCodec {
  compress(file: VideoFile): string {
    return `mpeg4-compressed(${file.filename})`;
  }
}

class CodecFactory {
  static extract(file: VideoFile): string {
    return file.filename.endsWith(".ogg") ? "ogg" : "mpeg4";
  }
}

class BitrateReader {
  static read(filename: string, codec: string): string {
    return `bitrate-data[${filename}, ${codec}]`;
  }
  static convert(buffer: string, codec: OggCompressionCodec | MPEG4CompressionCodec): string {
    return `converted(${buffer})`;
  }
}

class AudioMixer {
  fix(result: string): string {
    return `audio-fixed(${result})`;
  }
}

// The client must know the entire subsystem to convert a video.
function clientCode(filename: string, targetFormat: string): string {
  const file = new VideoFile(filename);
  const sourceCodecType = CodecFactory.extract(file);

  let destinationCodec: OggCompressionCodec | MPEG4CompressionCodec;
  if (targetFormat === "ogg") {
    destinationCodec = new OggCompressionCodec();
  } else {
    destinationCodec = new MPEG4CompressionCodec();
  }

  const buffer = BitrateReader.read(filename, sourceCodecType);
  const convertedBuffer = BitrateReader.convert(buffer, destinationCodec);
  const result = new AudioMixer().fix(convertedBuffer);

  return result;
}

console.log(clientCode("movie.ogg", "mp4"));
