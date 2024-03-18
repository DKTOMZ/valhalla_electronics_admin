import Image from "next/image";
import React from "react";

interface LogoProps {
  height?: number,
  width?: number
}

/**
 * Website logo
 */
const Logo: React.FC<LogoProps> = ({height=170, width=170}) => {

    return (
        <div>
          <Image src="/valhalla_dark.svg" className={`dark:block hidden`} alt="Valhalla_Logo" height={height} width={width} />
          <Image src="/valhalla_light.svg" className="dark:hidden block" alt="Valhalla_Logo" height={height} width={width}  />
      </div>
    );
};

export default Logo;