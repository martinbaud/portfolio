import { useState, useEffect, useCallback } from 'react';
import ReactCountryFlag from 'react-country-flag';
import {
  PersonIcon,
  MarkGithubIcon,
  ProjectIcon,
  GearIcon,
  MailIcon,
  OrganizationIcon,
  CodeIcon,
  RocketIcon,
  DeviceMobileIcon,
  GlobeIcon,
  ServerIcon,
  ToolsIcon,
  PackageIcon,
  DatabaseIcon,
  ArrowRightIcon,
  CheckIcon,
  LinkExternalIcon,
  ThreeBarsIcon,
  XIcon,
  DownloadIcon
} from '@primer/octicons-react';
import GlobeViewer from './components/GlobeViewer';
import { getBrowserLanguage, getTranslation } from './translations';
import './App.css';

function App() {
  const [lang, setLang] = useState(getBrowserLanguage());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const t = getTranslation(lang);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const cycleLanguage = useCallback(() => {
    setLang(prev => {
      if (prev === 'en') return 'es';
      if (prev === 'es') return 'fr';
      return 'en';
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <div className="logo-wrapper">
              <img src={`${import.meta.env.BASE_URL}assets/images/aeryflux_logo.png`} alt="Aeryflux Logo" className="logo-image" />
              <div className={`logo-spinner ${showSpinner ? 'show-on-load' : ''}`}></div>
            </div>
          </div>

          <button className="hamburger-menu" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <XIcon size={24} /> : <ThreeBarsIcon size={24} />}
          </button>

          <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#about" onClick={closeMobileMenu}><PersonIcon size={16} /> {t.nav.about}</a>
            <a href="#github" onClick={closeMobileMenu}><MarkGithubIcon size={16} /> {t.nav.github}</a>
            <a href="#projects" onClick={closeMobileMenu}><ProjectIcon size={16} /> {t.nav.projects}</a>
            <a href="#skills" onClick={closeMobileMenu}><GearIcon size={16} /> {t.nav.skills}</a>
            <a href="#contact" onClick={closeMobileMenu}><MailIcon size={16} /> {t.nav.contact}</a>
            <button
              onClick={cycleLanguage}
              className="lang-switcher"
              title={lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Français'}
            >
              <ReactCountryFlag
                countryCode={lang === 'en' ? 'US' : lang === 'es' ? 'ES' : 'FR'}
                svg
                style={{
                  width: '1.5em',
                  height: '1.5em',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section" id="about">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">{t.hero.name}</h1>
            <h2 className="hero-subtitle">{t.hero.role}</h2>
            <p className="hero-description">
              {t.hero.description}
            </p>
            <div className="cta-group">
              <a href="https://github.com/aeryflux" className="cta-button primary" target="_blank" rel="noopener noreferrer">
                <OrganizationIcon size={16} /> {t.hero.ctaPrimary}
              </a>
              <a href="https://github.com/martinbaud" className="cta-button secondary" target="_blank" rel="noopener noreferrer">
                <MarkGithubIcon size={16} /> {t.hero.ctaSecondary}
              </a>
              <a href={`${import.meta.env.BASE_URL}assets/cv/CV_Martin_Baud_${lang.toUpperCase()}.pdf`} className="cta-button cv-button" download>
                <DownloadIcon size={16} /> {t.hero.downloadCV}
              </a>
            </div>
          </div>

          <div className="hero-globe">
            <GlobeViewer selectedLanguage={lang} />
          </div>
        </div>
      </section>

      <section id="github" className="section github-section">
        <div className="container">
          <h2 className="section-title">{t.github.title}</h2>
          <div className="github-grid">
            <a href="https://github.com/aeryflux" className="github-card" target="_blank" rel="noopener noreferrer">
              <div className="card-icon"><OrganizationIcon size={32} /></div>
              <h3>{t.github.aeryflux.title}</h3>
              <p>{t.github.aeryflux.description}</p>
              <LinkExternalIcon size={16} className="external-link-icon" />
            </a>

            <a href="https://github.com/martinbaud" className="github-card" target="_blank" rel="noopener noreferrer">
              <div className="card-icon"><PersonIcon size={32} /></div>
              <h3>{t.github.personal.title}</h3>
              <p>{t.github.personal.description}</p>
              <LinkExternalIcon size={16} className="external-link-icon" />
            </a>
          </div>
        </div>
      </section>

      <section id="opensource" className="section opensource-section">
        <div className="container">
          <h2 className="section-title"><CodeIcon size={24} /> {t.opensource.title}</h2>
          <div className="project-card featured">
            <div className="project-header">
              <h3><PackageIcon size={20} /> {t.opensource.geojsonto3d.title}</h3>
              <span className="badge opensource">{t.opensource.geojsonto3d.badge}</span>
            </div>
            <p className="project-description">
              {t.opensource.geojsonto3d.description}
            </p>
            <div className="project-tech">
              <span className="tech-tag">Three.js</span>
              <span className="tech-tag">GeoJSON</span>
              <span className="tech-tag">3D</span>
              <span className="tech-tag">TypeScript</span>
            </div>
            <a href="https://github.com/aeryflux/geojsonto3D" className="project-link" target="_blank" rel="noopener noreferrer">
              <ArrowRightIcon size={16} /> {t.opensource.geojsonto3d.link}
            </a>
          </div>
        </div>
      </section>

      <section id="projects" className="section projects-section">
        <div className="container">
          <h2 className="section-title"><RocketIcon size={24} /> {t.projects.title}</h2>
          <p className="section-subtitle">{t.projects.subtitle}</p>

          <div className="projects-grid">
            <div className="project-card">
              <div className="project-header">
                <h3><DeviceMobileIcon size={20} /> {t.projects.expo.title}</h3>
                <span className="badge private">{t.projects.expo.badge}</span>
              </div>
              <p>{t.projects.expo.description}</p>
              <div className="project-tech">
                <span className="tech-tag">React Native</span>
                <span className="tech-tag">Expo</span>
                <span className="tech-tag">Three.js</span>
              </div>
            </div>

            <div className="project-card">
              <div className="project-header">
                <h3><GlobeIcon size={20} /> {t.projects.web.title}</h3>
                <span className="badge private">{t.projects.web.badge}</span>
              </div>
              <p>{t.projects.web.description}</p>
              <div className="project-tech">
                <span className="tech-tag">React</span>
                <span className="tech-tag">R3F</span>
                <span className="tech-tag">WebGL</span>
              </div>
            </div>

            <div className="project-card">
              <div className="project-header">
                <h3><ServerIcon size={20} /> {t.projects.api.title}</h3>
                <span className="badge private">{t.projects.api.badge}</span>
              </div>
              <p>{t.projects.api.description}</p>
              <div className="project-tech">
                <span className="tech-tag">Node.js</span>
                <span className="tech-tag">Express</span>
                <span className="tech-tag">PostgreSQL</span>
              </div>
            </div>

            <div className="project-card">
              <div className="project-header">
                <h3><ToolsIcon size={20} /> {t.projects.backoffice.title}</h3>
                <span className="badge private">{t.projects.backoffice.badge}</span>
              </div>
              <p>{t.projects.backoffice.description}</p>
              <div className="project-tech">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Admin Panel</span>
                <span className="tech-tag">REST API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section skills-section">
        <div className="container">
          <h2 className="section-title"><GearIcon size={24} /> {t.skills.title}</h2>

          <div className="skills-grid">
            <div className="skill-category">
              <h3><CodeIcon size={20} /> {t.skills.development.title}</h3>
              <ul className="skill-list">
                {t.skills.development.items.map((item, index) => (
                  <li key={index}><CheckIcon size={16} /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="skill-category">
              <h3><PackageIcon size={20} /> {t.skills.technologies.title}</h3>
              <ul className="skill-list">
                {t.skills.technologies.items.map((item, index) => (
                  <li key={index}><CheckIcon size={16} /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="skill-category">
              <h3><ServerIcon size={20} /> {t.skills.infrastructure.title}</h3>
              <ul className="skill-list">
                {t.skills.infrastructure.items.map((item, index) => (
                  <li key={index}><CheckIcon size={16} /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="skill-category">
              <h3><ToolsIcon size={20} /> {t.skills.tools.title}</h3>
              <ul className="skill-list">
                {t.skills.tools.items.map((item, index) => (
                  <li key={index}><CheckIcon size={16} /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4><PersonIcon size={20} /> {t.footer.title}</h4>
              <p>{t.footer.description}</p>
            </div>

            <div className="footer-section">
              <h4>{t.footer.links}</h4>
              <p>
                <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer">
                  <OrganizationIcon size={16} /> AeryFlux
                </a>
                {' · '}
                <a href="https://github.com/martinbaud" target="_blank" rel="noopener noreferrer">
                  <MarkGithubIcon size={16} /> GitHub
                </a>
                {' · '}
                <a href="mailto:contact@aeryflux.com">
                  <MailIcon size={16} /> martinbaud.git@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
