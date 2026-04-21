import { useEffect, useState } from "react";
import Loader from "./loader";

const withLoader = (WrappedComponent) => {
  return () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 600);

      return () => {
        clearTimeout(timeout);
      };
    }, []);

    if (loading) {
      return <Loader />;
    }

    return <WrappedComponent />;
  };
};

export default withLoader;
