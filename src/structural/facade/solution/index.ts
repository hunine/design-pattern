class VideoFile {
  readonly filename: string;
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

  static convert(
    buffer: string,
    codec: OggCompressionCodec | MPEG4CompressionCodec,
  ): string {
    return `converted(${buffer})`;
  }
}

class AudioMixer {
  fix(result: string): string {
    return `audio-fixed(${result})`;
  }
}

// ─── Facade ───────────────────────────────────────────────────────────────────
class VideoConverterFacade {
  convert(filename: string, format: string): string {
    const file = new VideoFile(filename);
    const sourceCodecType = CodecFactory.extract(file);
    const destinationCodec =
      format === "ogg"
        ? new OggCompressionCodec()
        : new MPEG4CompressionCodec();
    const buffer = BitrateReader.read(filename, sourceCodecType);
    const convertedBuffer = BitrateReader.convert(buffer, destinationCodec);
    const result = new AudioMixer().fix(convertedBuffer)

    return result;
  }
}

export {
  VideoConverterFacade,
  // Subsystem classes are exported so power users can still access them directly.
  VideoFile,
  OggCompressionCodec,
  MPEG4CompressionCodec,
  CodecFactory,
  BitrateReader,
  AudioMixer,
};

const converter = new VideoConverterFacade();
console.log(converter.convert("movie.ogg", "mp4"));
