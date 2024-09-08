import { NavBar, WaveCanvas, Location } from '../components';
import { Profile, GitHub, LinkedIn, X } from '../assets';

import styles from './Home.module.css';

const Home = () => {
  return (
    <div class={styles.Home}>
      <NavBar loc={Location.Header} links={[
        { text: 'About', href: '/about' },
        { text: 'Work', href: '/work' },
        { text: 'Contact', href: '/contact' }
      ]} />

      <div class={styles.intro}>
        <h1 class={styles.name}>
          Collin Murch
        </h1>
        <p class={styles.about}>
          Full stack software engineer.
        </p>
      </div>
      <img src={Profile} class={styles.logo} alt="logo" />

      <NavBar loc={Location.Footer} links={[
        { text: <img src={X} alt="twitter logo" class={styles.social} />, href: 'https://x.com/collinmurch' },
        { text: <img src={GitHub} alt="github logo" class={styles.social} />, href: 'https://github.com/collinmurch' },
        { text: <img src={LinkedIn} alt="linkedin logo" class={styles.social} />, href: 'https://linkedin.com/in/collinmurch' },
      ]} />
      <WaveCanvas style={styles.waveCanvas} />
    </div>
  );
}

export default Home;
