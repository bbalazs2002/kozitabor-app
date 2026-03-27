import React from 'react';
import InfoBlock from '../../features/core/InfoBlock';
import WhatToBringBlock from '../../features/core/WhatToBringBlock';
import ProgramBlock from '../../features/core/ProgramBlock';
import ContactBlock from '../../features/core/ContactBlock';

const HomePage: React.FC = () => (
    <>
        {/* KAPCSOLATOK KÁRTYA */}
        <ContactBlock />

        {/* FONTOS INFÓK KÁRTYA */}
        <InfoBlock />

        {/* MIT HOZZ KÁRTYA */}
        <WhatToBringBlock />

        {/* MENETREND KÁRTYA */}
        <ProgramBlock />
    </>
  );

export default HomePage;