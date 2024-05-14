"use client";

import React from "react";

const SimpleCounter = () => {
  const [counter, setCounter] = React.useState(60);

  // Third Attempts
  React.useEffect(() => {
    const timer =
      counter > 0 ? setInterval(() => setCounter(counter - 1), 1000) : -1;
    return () => clearInterval(timer);
  }, [counter]);

  return <>{counter}</>;
};

export default SimpleCounter;
