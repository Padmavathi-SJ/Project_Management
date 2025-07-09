import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
    const user = useSelector((State) => State.userSlice);

    // Only redirect if user tries to access a PUBLIC route while logged in
    // Don't interfere with private route access attempts
    if (user && window.location.pathname.startsWith('/login')) {
        let defaultRoute = '/student';
        if (user.role === 'admin') defaultRoute = '/admin';
        else if (user.role === 'guide') defaultRoute = '/guide';
        else if (user.role === 'subject_expert') defaultRoute = '/subject_expert';

        return <Navigate to={defaultRoute} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;