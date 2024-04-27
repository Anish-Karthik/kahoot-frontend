import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <div className="w-full flex justify-between items-center h-full px-8">
      <Image
        src={"/KahootLogo_Icon_purple.png"}
        width="20"
        height="20"
        alt="logo"
      />

      <div className="flex py-2 gap-2">
        <Button className="text-center font-bold bg-gray-100 hover:bg-gray-200 text-black/90 w-20 rounded-sm shadow-sm">
          Exit
        </Button>
        <Button className="text-center font-bold bg-gray-200 hover:bg-gray-300 text-black/90 w-20 rounded-sm shadow-sm">
          Save
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
