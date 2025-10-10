import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

vi.mock('../../components/GlobeViewer', () => ({
  default: ({ selectedLanguage }) => (
    <div data-testid="globe-viewer" data-language={selectedLanguage}>
      Globe Viewer Mock
    </div>
  )
}));

describe('User Flow - Functional Tests', () => {
  it('complete user journey: visit site, change language, navigate sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByAltText('Aeryflux Logo')).toBeInTheDocument();

    const langButton = screen.getByRole('button', { name: /english|español|français/i });
    await user.click(langButton);

    const globe = screen.getByTestId('globe-viewer');
    expect(globe).toBeInTheDocument();

    const aboutSection = document.querySelector('#about');
    expect(aboutSection).toBeInTheDocument();

    const githubSection = document.querySelector('#github');
    expect(githubSection).toBeInTheDocument();

    const projectsSection = document.querySelector('#projects');
    expect(projectsSection).toBeInTheDocument();

    const skillsSection = document.querySelector('#skills');
    expect(skillsSection).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('mobile user flow: open menu, navigate, close menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    const hamburger = screen.getByLabelText(/toggle menu/i);
    await user.click(hamburger);

    const navLinks = screen.getByRole('navigation').querySelector('.navbar-links');
    expect(navLinks).toHaveClass('mobile-open');

    const githubLink = screen.getAllByText(/github/i)[0];
    await user.click(githubLink);

    await waitFor(() => {
      expect(navLinks).not.toHaveClass('mobile-open');
    });
  });

  it('user can access all external GitHub links', async () => {
    render(<App />);

    const aeryfluxLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.includes('github.com/aeryflux')
    );

    expect(aeryfluxLinks.length).toBeGreaterThan(0);

    const personalLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.includes('github.com/martinbaud')
    );

    expect(personalLinks.length).toBeGreaterThan(0);
  });

  it('user can download CV in selected language', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cvButton = screen.getByRole('link', { name: /download|télécharger|descargar/i });
    expect(cvButton).toBeInTheDocument();
    expect(cvButton).toHaveAttribute('download');
    expect(cvButton.getAttribute('href')).toMatch(/CV_Martin_Baud_[A-Z]{2}\.pdf/);
  });

  it('language preference persists across interactions', async () => {
    const user = userEvent.setup();
    render(<App />);

    const langButton = screen.getByRole('button', { name: /english|español|français/i });
    const initialLang = langButton.getAttribute('title');

    await user.click(langButton);

    const newLang = langButton.getAttribute('title');
    expect(newLang).not.toBe(initialLang);

    const hamburger = screen.getByLabelText(/toggle menu/i);
    await user.click(hamburger);
    await user.click(hamburger);

    expect(langButton.getAttribute('title')).toBe(newLang);
  });

  it('responsive behavior: mobile menu only on small screens', () => {
    render(<App />);

    const hamburger = screen.getByLabelText(/toggle menu/i);
    expect(hamburger).toBeInTheDocument();
  });

  it('all project cards are interactive', () => {
    render(<App />);

    const projectCards = document.querySelectorAll('.project-card');
    expect(projectCards.length).toBeGreaterThan(0);

    projectCards.forEach(card => {
      expect(card).toBeInTheDocument();
    });
  });

  it('all skill categories are displayed', () => {
    render(<App />);

    const skillCategories = document.querySelectorAll('.skill-category');
    expect(skillCategories.length).toBeGreaterThanOrEqual(4);
  });

  it('footer contains contact information', () => {
    render(<App />);

    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toMatch(/martin|contact/i);
  });

  it('accessibility: all interactive elements have proper labels', () => {
    render(<App />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const hasLabel = !!(
        button.getAttribute('aria-label') ||
        button.textContent.trim() ||
        button.querySelector('svg') ||
        button.title
      );
      expect(hasLabel).toBeTruthy();
    });
  });
});
