import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Topbar from './Topbar.tsx';


const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const RootLayout = () => {

    // Auth logic removed as it's commented out and likely handled elsewhere or pending implementation

    return (
        <div className="w-full flex flex-col bg-[#F7F9FC] h-screen overflow-hidden">
            <ScrollToTop />
            <Topbar />
            <section
                id="scrollable-section"
                className="grow overflow-scroll py-4 md:py-6 px-4 md:px-8 lg:px-44"
            >
                <Outlet />
            </section>
        </div>
    );
};

export default RootLayout;