import Image from "next/image";
import QuestionSetActions from "./QuestionSetActions";

const Navbar = ({ id }: { id?: number }) => {
  return (
    <div className="w-full flex justify-between items-center h-full px-8">
      <Image
        src={"/KahootLogo_Icon_purple.png"}
        width="20"
        height="20"
        alt="logo"
      />
      <QuestionSetActions id={id} />
    </div>
  );
};

export default Navbar;
