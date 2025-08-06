const ProjectModel = require('../../Models/student/projects.js');
const createError = require('http-errors');

const ProjectController = {
  // Get initial data for project creation
// In getProjectFormData, add error handling
getProjectFormData: async (req, res, next) => {
  try {
    const { team_id } = req.params;
    
    const tl_reg_num = await ProjectModel.getTeamLeader(team_id);
    if (!tl_reg_num) {
      throw createError(400, "No team leader found for this team");
    }

    const [departments, staff] = await Promise.all([
      ProjectModel.getTeamDepartments(team_id),
      ProjectModel.getAvailableStaff()
    ]);

    // Since all staff can be both guides and experts, we return the same list twice
    res.json({
      success: true,
      data: {
        tl_reg_num,
        departments: departments || [],
        guides: staff,  // All available staff can be guides
        experts: staff  // All available staff can be experts
      }
    });
  } catch (error) {
    console.error("Error in getProjectFormData:", error);
    next(error);
  }
},

  // Create new project and send requests
  createProject: async (req, res, next) => {
    try {
      const { team_id } = req.params;
      const {
        project_name,
        cluster,
        description,
        outcome,
        hard_soft,
        project_type,
        tl_reg_num,
        selectedGuides,
        selectedExperts,
        semester
      } = req.body;

      // Validate inputs
      if (!project_name || !cluster || !description || !outcome || 
          !hard_soft || !project_type || !tl_reg_num || !semester) {
        throw createError(400, "Missing required fields");
      }

      // Generate project ID
      const project_id = await ProjectModel.generateProjectId();

      // Create project
      await ProjectModel.createProject({
        project_id,
        team_id,
        project_name,
        cluster,
        description,
        outcome,
        hard_soft,
        project_type,
        tl_reg_num
      });

      // Update team with project ID
      await ProjectModel.updateTeamProject(team_id, project_id);

      // Prepare and send guide requests
      if (selectedGuides?.length > 0) {
        const guideRequests = selectedGuides.map(guide_reg_num => ({
          from_team_id: team_id,
          project_id,
          to_guide_reg_num: guide_reg_num,
          project_name,
          team_semester: semester
        }));
        await ProjectModel.sendGuideRequests(guideRequests);
      }

      // Prepare and send expert requests
      if (selectedExperts?.length > 0) {
        const expertRequests = selectedExperts.map(expert_reg_num => ({
          from_team_id: team_id,
          project_id,
          to_expert_reg_num: expert_reg_num,
          project_name,
          team_semester: semester
        }));
        await ProjectModel.sendExpertRequests(expertRequests);
      }

      res.json({
        success: true,
        message: "Project created and requests sent successfully",
        data: { project_id }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProjectController;