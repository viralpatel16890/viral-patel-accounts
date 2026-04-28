import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders a button with default props', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    // Check for key classes instead of the full generated string
    expect(buttonElement).toHaveClass('bg-primary', 'h-9', 'px-4', 'py-2');
  });

  it('renders a button with custom class names', () => {
    render(<Button className="custom-class">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('custom-class');
    expect(buttonElement).toHaveClass('bg-primary', 'h-9', 'px-4', 'py-2');
  });

  it('renders with different variants and sizes', () => {
    render(
      <div>
        <Button variant="destructive" size="sm">
          Destructive Small
        </Button>
        <Button variant="outline" size="lg">
          Outline Large
        </Button>
        <Button variant="ghost" size="xs">
          Ghost Extra Small
        </Button>
        <Button variant="blue" size="icon">
          Blue Icon
        </Button>
      </div>
    );

    // Asserting key classes for each variant/size combination
    expect(screen.getByText('Destructive Small')).toHaveClass('bg-destructive', 'h-8', 'gap-1.5');
    expect(screen.getByText('Outline Large')).toHaveClass('border', 'h-10', 'px-6');
    expect(screen.getByText('Ghost Extra Small')).toHaveClass('hover:bg-accent', 'h-7', 'px-2');
    expect(screen.getByText('Blue Icon')).toHaveClass('bg-blue-600', 'size-9');
  });

  it('renders as a different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#" className="link-button">
          Link Button
        </a>
      </Button>
    );
    const linkElement = screen.getByRole('link', { name: /link button/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveClass('link-button');
    // Check for key classes applied to the link element due to asChild
    expect(linkElement).toHaveClass('bg-primary', 'h-9', 'px-4');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    await userEvent.click(screen.getByRole('button', { name: /clickable/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button', { name: /disabled button/i })).toBeDisabled();
  });

  it('passes through arbitrary props', () => {
    // Find the button by its text content and then assert the aria-label attribute.
    render(<Button aria-label="custom-aria-label">Props Test</Button>);
    const buttonElement = screen.getByText('Props Test');
    expect(buttonElement).toHaveAttribute('aria-label', 'custom-aria-label');
  });
});
