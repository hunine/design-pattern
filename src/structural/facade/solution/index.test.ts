import { VideoConverterFacade } from "./index";

describe("Facade", () => {
  it("convert() returns a result string without the client knowing any subsystem class", () => {
    const converter = new VideoConverterFacade();
    const result = converter.convert("movie.ogg", "mp4");
    expect(typeof result).toBe("string");
  });

  it("convert() includes the source filename in the output", () => {
    const converter = new VideoConverterFacade();
    const result = converter.convert("documentary.ogg", "mp4");
    expect(result).toContain("documentary.ogg");
  });

  it("convert() applies audio fixing (output contains audio-fixed)", () => {
    const converter = new VideoConverterFacade();
    const result = converter.convert("movie.ogg", "mp4");
    expect(result).toContain("audio-fixed");
  });

  it("convert() works for both ogg and mp4 target formats", () => {
    const converter = new VideoConverterFacade();
    const toMp4 = converter.convert("clip.ogg", "mp4");
    const toOgg = converter.convert("clip.mp4", "ogg");
    expect(typeof toMp4).toBe("string");
    expect(typeof toOgg).toBe("string");
  });

  it("ogg and mp4 source files produce different output (different codec paths)", () => {
    const converter = new VideoConverterFacade();
    const fromOgg = converter.convert("video.ogg", "mp4");
    const fromMp4 = converter.convert("video.mp4", "ogg");
    expect(fromOgg).not.toBe(fromMp4);
  });
});
