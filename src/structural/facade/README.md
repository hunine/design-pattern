# Facade

**Category:** Structural

---

## Intent

Facade is a structural design pattern that provides a **simplified interface to a complex subsystem**.

The key idea: hide the messy internals behind a single clean entry point. Client code calls one method on the facade instead of orchestrating half a dozen low-level objects.

---

## The Problem

Converting a video file requires orchestrating `VideoFile`, `CodecFactory`, `BitrateReader`, and `AudioMixer` in exactly the right order:

```typescript
function clientCode(filename: string, targetFormat: string): string {
  const file = new VideoFile(filename);
  const sourceCodecType = CodecFactory.extract(file);

  let destinationCodec: OggCompressionCodec | MPEG4CompressionCodec;
  if (targetFormat === "ogg") {
    destinationCodec = new OggCompressionCodec();
  } else {
    destinationCodec = new MPEG4CompressionCodec();
  }

  const buffer          = BitrateReader.read(filename, sourceCodecType);
  const convertedBuffer = BitrateReader.convert(buffer, destinationCodec);
  return new AudioMixer().fix(convertedBuffer);
}
```

Problems:
- **Client must know the entire subsystem**: class names, method names, invocation order.
- **Any subsystem change** (e.g., `BitrateReader` gains a new step) ripples into every client.
- **Boilerplate is duplicated** everywhere video conversion is needed.
- **Hard to test**: testing the client requires setting up the entire subsystem.

---

## The Solution

Create a `VideoConverterFacade` that hides all subsystem details. Client code calls one method:

```typescript
class VideoConverterFacade {
  convert(filename: string, format: string): string {
    const file            = new VideoFile(filename);
    const sourceCodec     = CodecFactory.extract(file);
    const destCodec       = format === "ogg"
      ? new OggCompressionCodec()
      : new MPEG4CompressionCodec();
    const buffer          = BitrateReader.read(filename, sourceCodec);
    const convertedBuffer = BitrateReader.convert(buffer, destCodec);
    return new AudioMixer().fix(convertedBuffer);
  }
}

// Client no longer knows about codecs, bitrate readers, or audio mixers.
const converter = new VideoConverterFacade();
console.log(converter.convert("movie.ogg", "mp4"));
```

The subsystem still exists in full. The facade is just a convenient front door.

---

## Structure

```
Client → VideoConverterFacade (Facade)
              ├── VideoFile
              ├── CodecFactory
              ├── BitrateReader
              └── AudioMixer
                    (Subsystem — unchanged, still accessible directly if needed)
```

### Participants

| Role | Responsibility |
|---|---|
| **Facade** (`VideoConverterFacade`) | Provides a simple interface; delegates to subsystem classes |
| **Subsystem** (`VideoFile`, `CodecFactory`, …) | Performs the actual work; is unaware of the facade |
| **Client** | Calls the facade; has no knowledge of subsystem internals |

---

## How to Implement

1. **Identify a complex subsystem** that clients must orchestrate.

2. **Create a Facade class** that declares methods matching the high-level use cases clients actually need.

3. **Implement each facade method** by orchestrating the right subsystem calls in the right order.

4. **Do not delete the subsystem classes** — power users who need fine-grained control can still use them directly.

5. **Replace complex client code** with calls to the facade.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function clientCode(filename: string, targetFormat: string): string {
  const file = new VideoFile(filename);
  const sourceCodecType = CodecFactory.extract(file);
  // ... 6 more steps ...
  return new AudioMixer().fix(convertedBuffer);
}
```

Problems:
- Knowing the correct step order is the client's responsibility.
- Subsystem API changes propagate into client code.
- Every new caller duplicates the same orchestration.

### After (solution) — `solution/index.ts`

```typescript
const result = new VideoConverterFacade().convert("movie.ogg", "mp4");
```

Benefits:
- Client goes from ~12 lines of orchestration to 1 line.
- Subsystem changes only require updating the facade.
- The facade is easy to mock in unit tests of the client.

---

## When to Use

- **You need a simple interface** to a complex subsystem (library, framework, layered architecture).
- **You want to structure a subsystem into layers**: each layer's facade becomes the entry point for the next layer.
- **You want to reduce dependencies**: clients depend on the facade, not on dozens of subsystem classes.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Shields clients from subsystem complexity | Facade can become a "god object" if it takes on too much |
| Reduces coupling between client and subsystem | May not expose all functionality power users need |
| Easier to change the subsystem without affecting clients | |

---

## Relations with Other Patterns

- **Adapter** makes two *incompatible* interfaces work together. Facade provides a *simpler* interface to an existing one.
- **Abstract Factory** can serve as an alternative to Facade when the goal is to hide only the object-creation part of a subsystem.
- **Mediator** also centralises communication, but between objects of equal standing. Facade is a one-way simplification.
- **Singleton**: Facade objects are often Singletons — one facade per subsystem is usually sufficient.
- **Proxy** controls access to a single object. Facade simplifies access to many objects.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Client directly orchestrates `VideoFile`, `CodecFactory`, `BitrateReader`, `AudioMixer` |
| `solution/index.ts` | `VideoConverterFacade.convert()` hides the entire subsystem |
| `solution/index.test.ts` | Verifies the facade produces the correct result without knowing subsystem details |

**Challenge:** add an `AudioExtractorFacade` that extracts audio from a video file in 3 steps — without changing any of the existing subsystem classes.
