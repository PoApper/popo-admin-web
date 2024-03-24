import '../styles/globals.css';
import 'semantic-ui-css/semantic.min.css';
import Error from 'next/error';

function MyApp({ Component, pageProps }) {
  const error = pageProps.error;

  if (pageProps.error) {
    return <Error statusCode={error.statusCode} title={error.message} />;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
