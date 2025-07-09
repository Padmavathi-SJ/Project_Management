import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
    const user = useSelector((State) => State.userSlice);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has any of the allowed roles
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the default route for their actual role
        let defaultRoute = '/student'; // Changed from '/dashboard' to '/student'
        if (user.role === 'admin') defaultRoute = '/admin';
        else if (user.role === 'staff') defaultRoute = '/guide';
        else if (user.role === 'subject_expert') defaultRoute = '/subject_expert';

        return <Navigate to={defaultRoute} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;