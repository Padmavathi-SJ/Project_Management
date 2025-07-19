import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login/Login";
import Student from "./components/Students/Student";
import "./index.css";
import Student_Dashboard from "./components/Students/Student_Dashboard";
import Progress_Update from "./components/Students/Progress_Update";
import Project_Details from "./components/Students/Project_Details";
//import Student_Team from "./components/Students/Schedule_review";
import Admin from "./components/Admin/Admin";
import Add_Users from "./components/Admin/Add_Users";
import Posted_project from "./components/Admin/Posted_project";
import Admin_Dashboard from "./components/Admin/Admin_Dashboard";
import { Provider } from "react-redux";
import { Store } from "./utils/Store";
import InvitationPage from "./components/Students/InvitationPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import SubjectExpertDashboard from "./components/Subject_expert/Student_export_dashboard";
import Subject_expert_remarks from "./components/Subject_expert/Subject_expert_remarks";
import Subject_expert from "./components/Subject_expert/Subject_expert";
import Guide from "./components/guide/guide";
import Staff_dashboard from "./components/guide/Staff_dashboard";
import Guide_team_progress from "./components/guide/Guide_team_progress";
import Queries from "./components/Students/Queries";
import { getProfile } from "./services/authService";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
// import Proj_Details from "./components/Students/Proj_Details";
import ProjectFileUpload from "./components/Students/ProjectFileUpload";
import Admin_project_details from "./components/Admin/Admin_project_details";
import TimeLine from "./components/Admin/Timeline";
import TeamListByDepartment from "./components/Admin/TeamListByDepartment";
import NotFound from "./NotFound";
import Student_expert_review from "./components/Subject_expert/Student_expert_review";
import Review_Schedules from "./components/Students/ReviewSchedules";
import ChangeTimeLine from "./components/Admin/ChangeTimeLine";
import { useSelector } from "react-redux";
import Review_projects from "./components/guide/Review_projects";
import TeamDetails from "./components/guide/Team_Details";
import ChallengeReviewAdmin from "./components/Students/ChallengeReview";
import Team_Details from "./components/guide/Team_Details";
import Guide_queries from "./components/guide/Guide_queries";
import WeeklyLogsHistory from "./components/Students/week";
import AssignGuideExpert from "./components/Admin/AssignGuideExpert";
import WeekLogUpdate from "./components/Admin/WeekLogUpdate";
import GoogleAuthHandler from "./components/Login/GoogleAuthHandler ";
import BulkUploadUsers from "./components/Admin/BulkUploadUsers";
import PrivateRoute from "./components/Login/PrivateRoute";
import PublicRoute from "./components/Login/PublicRoute";

import ReviewScheduling from "./components/guide/Review_Scheduling";
import ReviewProgress from "./components/guide/Review_Progress";

import AwardMarks from "./components/guide/AwardMarks";
import StudentReviewProgress from "./components/Students/ReviewProgress";
import OptionalReview from "./components/Students/OptionalReview";
import OptionalReviewRequests from "./components/guide/OptionalReviewRequests";
import ScheduleOptionalReview from "./components/guide/schedule_optional_review";
import SubExpertScheduleOptionalReview from "./components/Subject_expert/schedule_optional_review";
import OptionalReviewProgress from "./components/guide/OptionalReviewProgress";
import AwardOptionalMarks from "./components/guide/OptionalAwardMarks";

/*
import GuideScheduleReview from './components/guide/schedule_review';
import SubExpertScheduleReview from './components/Subject_expert/Schedule_review';
*/

const Loader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await getProfile(dispatch, navigate);
      } catch (error) {
        navigate("/login");
      }
    };

    loadProfile();
  }, [dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-40">
      <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

function App() {
  const userselector = useSelector((State) => State.userSlice);
  const teamselector = useSelector((state) => state.teamSlice);
  console.log(userselector, "user selector");
  return (
    <Provider store={Store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loader />} />

          {/* Public Routes */}
          {/* <Route element={<PublicRoute />}> */}
          <Route path="/login" element={<Login />} />
          <Route path="/google-auth" element={<GoogleAuthHandler />} />
          {/* </Route> */}

          {/* Student Routes */}
          <Route element={<PrivateRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<Student />}>
              <Route index element={<Student_Dashboard />} />
              <Route path="invitations" element={<InvitationPage />} />
              {/* <Route path="Project_Details/proj_details/:id" element={<Proj_Details />} /> */}
              <Route
                path="upload-project-files"
                element={<ProjectFileUpload />}
              />
              {teamselector ? (
                <>
                  <Route path="Project_Details" element={<Project_Details />} />
                  {userselector?.guide_reg_num && (
                    <>
                      <Route path="queries" element={<Queries />} />
                      <Route path="review" element={<Review_Schedules />} />
                      <Route
                        path="Progress_update"
                        element={<StudentReviewProgress />}
                      />
                      <Route path="week" element={<WeeklyLogsHistory />} />
                      <Route
                        path="optional-review/:student_reg_num/:team_id"
                        element={<OptionalReview />}
                      />
                    </>
                  )}
                </>
              ) : null}
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Admin_Dashboard />} />
              <Route path="add_users" element={<Add_Users />} />
              <Route path="Bulk_Upload_Users" element={<BulkUploadUsers />} />
              <Route path="posted_projects" element={<Posted_project />} />
              <Route
                path="/admin/posted_projects/:project_id"
                element={<Admin_project_details />}
              />
              <Route
                path="student_progress/:cluster"
                element={<Admin_project_details />}
              />
              <Route path="TimeLine" element={<TimeLine />} />
              <Route
                path="team_list/:department"
                element={<TeamListByDepartment />}
              />
              <Route
                path="/admin/team_progress/:project_id"
                element={<Admin_project_details />}
              />
              <Route
                path="TimeLine/change-timeline"
                element={<ChangeTimeLine />}
              />
              <Route
                path="TimeLine/challenge-review"
                element={<ChallengeReviewAdmin />}
              />
              <Route
                path="timeline/assignguideexpert"
                element={<AssignGuideExpert />}
              />
              <Route
                path="timeline/weeklogupdate"
                element={<WeekLogUpdate />}
              />
              <Route
                path="timeline/weekloginsert"
                element={<WeekLogUpdate />}
              />
            </Route>
          </Route>

          {/* Guide Routes */}
          <Route element={<PrivateRoute allowedRoles={["staff"]} />}>
            <Route path="/guide" element={<Guide />}>
              <Route index element={<Staff_dashboard />} />
              <Route path="queries" element={<Guide_queries />} />
              <Route path="team_progress" element={<Guide_team_progress />} />
              <Route path="review_progress" element={<ReviewProgress />} />
              <Route path="team-details/:teamId" element={<Team_Details />} />
              <Route path="schedule-review" element={<ReviewScheduling />} />
              <Route
                path="award-marks/:reg_num/team/:team_id"
                element={<AwardMarks />}
              />
              <Route
                path="optional_review_requests"
                element={<OptionalReviewRequests />}
              />
              <Route
                path="schedule_optional_review"
                element={<ScheduleOptionalReview />}
              />
              <Route
                path="optional_review_progress"
                element={<OptionalReviewProgress />}
              />
              <Route
                path="award_optional_marks/:reg_num/team/:team_id"
                element={<AwardOptionalMarks />}
              />
            </Route>
          </Route>

          {/* Subject_Expert routes */}
          <Route path="/subject_expert" element={<Subject_expert />}>
            <Route index element={<SubjectExpertDashboard />} />
            <Route path="review" element={<Student_expert_review />} />
            <Route path="remarks" element={<Subject_expert_remarks />} />
            <Route
              path="schedule_optional_review"
              element={<SubExpertScheduleOptionalReview />}
            />
            <Route
              path="award_optional_marks/:reg_num/team/:team_id"
              element={<AwardOptionalMarks />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
