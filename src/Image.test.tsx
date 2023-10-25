import {Mock, vi, describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {faker} from '@faker-js/faker';
import {Image} from './Image.js';

const defaultProps = {
  sizes: '100vw',
  src: 'https://cdn.shopify.com/s/files/1/0551/4566/0472/products/Main.jpg',
};

describe('<Image />', () => {
  // This test fails because the received src has ?width=100 appended to it
  it.skip('renders an `img` element', () => {
    const src = faker.image.imageUrl();

    render(<Image {...defaultProps} src={src} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', src);
  });

  it('accepts passthrough props such as `id`', () => {
    const id = faker.random.alpha();

    render(<Image {...defaultProps} id={id} />);

    expect(screen.getByRole('img')).toHaveAttribute('id', id);
  });

  it('sets the `alt` prop on the img tag', () => {
    const alt = faker.random.alpha();

    render(<Image {...defaultProps} alt={alt} />);

    expect(screen.getByRole('img')).toHaveAttribute('alt', alt);
  });

  it('has a `loading` prop of `lazy` by default', () => {
    render(<Image {...defaultProps} />);

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('accepts a `loading` prop', () => {
    render(<Image {...defaultProps} loading="eager" />);

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  it('accepts a `sizes` prop', () => {
    render(<Image {...defaultProps} sizes="100vw" />);

    expect(screen.getByRole('img')).toHaveAttribute('sizes', '100vw');
  });

  describe('loader', () => {
    it('calls the loader with the src, width, height and crop props', () => {
      const loader = vi.fn();
      const src = faker.image.imageUrl();
      const width = 600;
      const height = 400;
      const crop = 'center';

      render(
        <Image
          {...defaultProps}
          src={src}
          width={width}
          crop={crop}
          height={height}
          loader={loader}
        />,
      );

      expect(loader).toHaveBeenCalledWith({
        src,
        width,
        height,
        crop,
      });
    });
  });

  describe('aspect-ratio', () => {
    // Assertion support is limited for aspectRatio
    // https://github.com/testing-library/jest-dom/issues/452
    // expect(image).toHaveStyle('aspect-ratio: 1 / 1');

    it('sets the aspect-ratio on the style prop when set explicitly', () => {
      const aspectRatio = '4/3';

      render(
        <Image {...defaultProps} sizes="100vw" aspectRatio={aspectRatio} />,
      );

      expect(screen.getByRole('img').style.aspectRatio).toBe(aspectRatio);
    });

    it('infers the aspect-ratio from the storefront data', () => {
      const data = {height: 300, width: 400};

      render(<Image {...defaultProps} sizes="100vw" data={data} />);

      expect(screen.getByRole('img').style.aspectRatio).toBe('400/300');
    });

    it('infers the aspect-ratio from the storefront data for fixed-width images when no height prop is provided', () => {
      const data = {height: 300, width: 400};

      render(<Image {...defaultProps} sizes="100vw" data={data} width={600} />);

      expect(screen.getByRole('img').style.aspectRatio).toBe('400/300');
    });

    it('infers the aspect-ratio from the storefront data for fixed-width images the height and width are different units', () => {
      const data = {height: 300, width: 400};

      render(
        <Image
          {...defaultProps}
          sizes="100vw"
          data={data}
          height={400}
          width="100%"
        />,
      );

      expect(screen.getByRole('img').style.aspectRatio).toBe('400/300');
    });

    it('infers the aspect-ratio from the height and width props for fixed-width images', () => {
      const data = {height: 300, width: 400};

      render(
        <Image
          {...defaultProps}
          sizes="100vw"
          data={data}
          width={600}
          height={400}
        />,
      );

      expect(screen.getByRole('img').style.aspectRatio).toBe('600/400');
    });
  });

  describe('warnings', () => {
    const consoleMock = {
      ...console,
      warn: vi.fn(),
    };

    vi.stubGlobal('console', consoleMock);

    afterAll(() => {
      vi.unstubAllGlobals();
    });

    it('warns user if no src is provided', () => {
      render(<Image {...defaultProps} src={undefined} />);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarnings()).toMatchInlineSnapshot(
        `
          [
            "No src or data.url provided to Image component.",
          ]
        `,
      );
    });

    it('warns user if no sizes are provided', () => {
      render(<Image {...defaultProps} width="100%" sizes={undefined} />);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarnings()).toMatchInlineSnapshot(
        `
        [
          "No sizes prop provided to Image component, you may be loading unnecessarily large images. Image used is https://cdn.shopify.com/s/files/1/0551/4566/0472/products/Main.jpg",
        ]
      `,
      );
    });

    it('does not warn user if no sizes are provided but width is fixed', () => {
      render(<Image {...defaultProps} sizes={undefined} width={100} />);
      expect(console.warn).toHaveBeenCalledTimes(0);
    });
  });
});

function getWarnings(): string[] {
  return (console.warn as Mock<[string]>).mock.calls.map(
    ([message]) => message,
  );
}
