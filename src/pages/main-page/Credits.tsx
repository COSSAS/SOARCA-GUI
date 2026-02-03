import React, { useEffect, useState } from "react";

import { FormLabel, Link } from "@/components";
import {
  DetailsItem,
  DetailsValue,
} from "@/pages/main-page/monitoring-page/ExecutionDetailPage.styles";
import { MadeWithLove, PixelHeart } from "./Credits.styles";

/**
 * Little fun easter egg that shows credits when the user types "credits".
 * It also desappears when the user types anything else.
 * I would like to add all the contributosrs here, but for now it's just me :)
 */
export const CreditsEasterEgg: React.FC = () => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState("");

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newBuffer = (keyBuffer + e.key).slice(-7);
      setKeyBuffer(newBuffer);

      if (newBuffer === "credits") {
        setShowEasterEgg(true);
      } else if (showEasterEgg) {
        setShowEasterEgg(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [keyBuffer, showEasterEgg]);

  if (!showEasterEgg) {
    return null;
  }

  return (
    <DetailsItem>
      <FormLabel>Credits</FormLabel>
      <DetailsValue>
        <MadeWithLove>
          Made with
          <PixelHeart>❤️</PixelHeart>
          by
          <Link $to="https://github.com/Paul2803k">Paul2803k</Link>
        </MadeWithLove>
      </DetailsValue>
    </DetailsItem>
  );
};
