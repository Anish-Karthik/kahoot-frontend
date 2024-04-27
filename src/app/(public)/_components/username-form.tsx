"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const UsernameForm = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-sm w-72 scale-110">
      <Input
        placeholder="Username"
        className="text-center font-bold w-full rounded-sm"
      />
      <Button className="text-center font-bold bg-black/90 w-full rounded-sm">
        Enter
      </Button>
    </div>
  );
};

export default UsernameForm;
