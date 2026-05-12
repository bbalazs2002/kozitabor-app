import { type FC, useEffect, useState } from "react";
import { useDb } from "../../context/core/DbContext";
import CamperTaskBlock from "../../features/core/CamperTaskBlock";
import ContactBlock from "../../features/core/ContactBlock";
import DeadlinesBlock from "../../features/core/DeadlinesBlock";
import InfoBlock from "../../features/core/InfoBlock";
import ProgramBlock from "../../features/core/ProgramBlock";
import WhatToBringBlock from "../../features/core/WhatToBringBlock";

const HomePage: FC = () => {
  const { getSettingByStrId } = useDb();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    getSettingByStrId("app_status").then((s) => {
      setIsActive(s?.value === "active");
    });
  }, [getSettingByStrId]);

  if (isActive)
    return (
      <>
        <ProgramBlock />
        <CamperTaskBlock />
        <ContactBlock />
        <InfoBlock />
      </>
    );

  return (
    <>
      <DeadlinesBlock limit={5} />
      <InfoBlock />
      <WhatToBringBlock />
      <ContactBlock />
    </>
  );
};

export default HomePage;
