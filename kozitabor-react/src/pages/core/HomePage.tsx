import { useEffect, useState } from 'react';
import InfoBlock from '../../features/core/InfoBlock';
import WhatToBringBlock from '../../features/core/WhatToBringBlock';
import ProgramBlock from '../../features/core/ProgramBlock';
import ContactBlock from '../../features/core/ContactBlock';
import CamperTaskBlock from '../../features/core/CamperTaskBlock';
import DeadlinesBlock from '../../features/core/DeadlinesBlock';
import { useDb } from '../../context/core/DbContext';

const HomePage: React.FC = () => {
    const { getSettingByStrId } = useDb();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        getSettingByStrId('app_status').then(s => {
            setIsActive(s?.value === 'active');
        });
    }, [getSettingByStrId]);

    if (isActive) return (
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
