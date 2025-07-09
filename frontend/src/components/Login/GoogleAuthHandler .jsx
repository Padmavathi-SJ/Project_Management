import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { addUser } from '../utils/userSlice';
// import instance from '../utils/axiosInstance';
import { addUser } from '../../utils/userSlice';
import instance from '../../utils/axiosInstance';

function GoogleAuthHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Store token in local storage
            localStorage.setItem('accessToken', token);

            // Fetch user profile and dispatch to Redux
            const fetchProfile = async () => {
                try {
                    const response = await instance.get('/api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log(response, "response");
                    if (response.data.isAuthenticated) {
                        dispatch(addUser(response.data.user));

                        // Redirect based on role
                        if (response.data.user.role === 'student') {
                            const projectTypeRes = await instance.get(`/student/get_project_type/${response.data.user.reg_num}`);
                            const projectType = projectTypeRes.data;

                            if (projectType === "internal" || projectType === "external") {
                                navigate("/student");
                            } else {
                                // Handle project type selection
                                navigate("/student");
                            }
                        } else if (response.data.user.role === 'admin') {
                            navigate("/admin");
                        } else if (response.data.user.role === 'staff') {
                            navigate("/guide");
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    navigate("/login");
                }
            };

            fetchProfile();
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate, dispatch]);

    return <div>Loading...</div>;
}

export default GoogleAuthHandler;