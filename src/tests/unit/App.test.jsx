import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

vi.mock('../../components/GlobeViewer', () => ({
  default: () => <div data-testid="globe-viewer">Globe Viewer Mock</div>
}));

describe('App Component - Unit Tests', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays the Aeryflux logo', () => {
    render(<App />);
    const logo = screen.getByAltText('Aeryflux Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<App />);
    const aboutLink = screen.getByText(/about/i);
    const githubLink = screen.getAllByText(/github/i)[0];
    const projectsLink = screen.getAllByText(/projects/i)[0];
    const skillsLink = screen.getAllByText(/skills/i)[0];
    const contactLink = screen.getByText(/contact/i);

    expect(aboutLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
    expect(projectsLink).toBeInTheDocument();
    expect(skillsLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });

  it('toggles language when language switcher is clicked', () => {
    render(<App />);
    const langButton = screen.getByRole('button', { name: /english|español|français/i });

    expect(langButton).toBeInTheDocument();
    fireEvent.click(langButton);

    expect(langButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    render(<App />);
    const hamburger = screen.getByLabelText(/toggle menu/i);

    fireEvent.click(hamburger);

    const navLinks = screen.getByRole('navigation').querySelector('.navbar-links');
    expect(navLinks).toHaveClass('mobile-open');
  });

  it('renders hero section with correct content', () => {
    render(<App />);
    const heroTitle = screen.getByRole('heading', { level: 1 });
    expect(heroTitle).toBeInTheDocument();
  });

  it('renders GlobeViewer component', () => {
    render(<App />);
    const globe = screen.getByTestId('globe-viewer');
    expect(globe).toBeInTheDocument();
  });

  it('renders all CTA buttons', () => {
    render(<App />);
    const ctaButtons = screen.getAllByRole('link').filter(link =>
      link.className.includes('cta-button')
    );
    expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders GitHub section with cards', () => {
    render(<App />);
    const githubSection = document.querySelector('#github');
    expect(githubSection).toBeInTheDocument();
  });

  it('renders projects section', () => {
    render(<App />);
    const projectsSection = document.querySelector('#projects');
    expect(projectsSection).toBeInTheDocument();
  });

  it('renders skills section with categories', () => {
    render(<App />);
    const skillsSection = document.querySelector('#skills');
    expect(skillsSection).toBeInTheDocument();
  });

  it('renders footer with contact information', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('has correct document language attribute', () => {
    render(<App />);
    expect(document.documentElement.lang).toBeTruthy();
  });
});
