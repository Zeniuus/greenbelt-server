interface Image {
  mimeType: string;
  buffer: Buffer;
}

class TemporaryImageHolder {
  images: { [key: string]: Image }
  constructor() {
    this.images = {}
  }

  put(name: string, image: Image) {
    this.images[name] = image;
    setTimeout(() => {
      delete this.images[name];
    }, 60 * 1000);
  }

  get(name: string): Image {
    return this.images[name];
  }
}

export default new TemporaryImageHolder();
