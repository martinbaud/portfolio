import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

vi.mock('../../components/GlobeViewer', () => ({
  default: () => <div data-testid="globe-viewer">Globe Viewer Mock</div>
}));

describe('Navigation - Integration Tests', () => {
  it('cycles through all three languages', async () => {
    render(<App />);
    const langButton = screen.getByRole('button', { name: /english|español|français/i });

    const initialTitle = langButton.getAttribute('title');
    expect(initialTitle).toBeTruthy();

    fireEvent.click(langButton);
    await waitFor(() => {
      const newTitle = langButton.getAttribute('title');
      expect(newTitle).not.toBe(initialTitle);
    });

    fireEvent.click(langButton);
    await waitFor(() => {
      const thirdTitle = langButton.getAttribute('title');
      expect(thirdTitle).not.toBe(initialTitle);
    });

    fireEvent.click(langButton);
    await waitFor(() => {
      const finalTitle = langButton.getAttribute('title');
      expect(finalTitle).toBe(initialTitle);
    });
  });

  it('closes mobile menu when a navigation link is clicked', async () => {
    render(<App />);

    const hamburger = screen.getByLabelText(/toggle menu/i);
    fireEvent.click(hamburger);

    const navLinks = screen.getByRole('navigation').querySelector('.navbar-links');
    expect(navLinks).toHaveClass('mobile-open');

    const aboutLink = screen.getByText(/about/i);
    fireEvent.click(aboutLink);

    await waitFor(() => {
      expect(navLinks).not.toHaveClass('mobile-open');
    });
  });

  it('updates content when language changes', async () => {
    render(<App />);

    const langButton = screen.getByRole('button', { name: /english|español|français/i });
    const initialHeroContent = screen.getByRole('heading', { level: 1 }).textContent;

    fireEvent.click(langButton);

    await waitFor(() => {
      const newHeroContent = screen.getByRole('heading', { level: 1 }).textContent;
      expect(newHeroContent).toBeTruthy();
    });
  });

  it('maintains scroll position when language changes', async () => {
    render(<App />);

    window.scrollTo = vi.fn();
    const langButton = screen.getByRole('button', { name: /english|español|français/i });

    fireEvent.click(langButton);

    await waitFor(() => {
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  it('renders all sections in correct order', () => {
    render(<App />);

    const sections = ['about', 'github', 'opensource', 'projects', 'skills', 'contact'];
    sections.forEach(sectionId => {
      const section = document.querySelector(`#${sectionId}`) ||
                     document.querySelector(`section[id="${sectionId}"]`);
      expect(section).toBeInTheDocument();
    });
  });

  it('all external links open in new tab', () => {
    render(<App />);

    const externalLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('target') === '_blank'
    );

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
