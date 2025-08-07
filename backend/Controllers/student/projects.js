// Controllers/student/projects.js
const ProjectModel = require('../../Models/student/projects.js');
const createError = require('http-errors');

const ProjectController = {
  // Get initial data for project creation
  getProjectFormData: async (req, res, next) => {
    try {
      const { team_id } = req.params;
      
      const [tl_reg_num, departments, staff] = await Promise.all([
        ProjectModel.getTeamLeader(team_id),
        ProjectModel.getTeamDepartments(team_id),
        ProjectModel.getAvailableStaff()
      ]);

      if (!tl_reg_num) {
        throw createError(400, "No team leader found for this team");
      }

      res.json({
        success: true,
        data: {
          tl_reg_num,
          departments: departments || [],
          guides: staff,
          experts: staff
        }
      });
    } catch (error) {
      console.error("Error in getProjectFormData:", error);
      next(error);
    }
  },

  // Create new project with cluster mapping
  createProject: async (req, res, next) => {
    try {
      const { team_id } = req.params;
      const {
        project_name,
        cluster, // This is the department from frontend
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
      const errors = [];
      if (!project_name) errors.push("Project name is required");
      if (!cluster) errors.push("Department is required");
      if (!description) errors.push("Description is required");
      if (!outcome) errors.push("Expected outcome is required");
      if (!hard_soft) errors.push("Project type (hardware/software) is required");
      if (!project_type) errors.push("Project scope (internal/external) is required");
      if (!tl_reg_num) errors.push("Team leader registration number is required");
      if (!semester) errors.push("Semester is required");
      if (selectedGuides?.length === 0) errors.push("Please select at least one guide");
      if (selectedExperts?.length === 0) errors.push("Please select at least one expert");
      
      if (errors.length > 0) {
        throw createError(400, errors.join('\n'));
      }

      // Generate project ID
      const project_id = await ProjectModel.generateProjectId();

      // Create project (cluster mapping happens in the model)
      await ProjectModel.createProject({
        project_id,
        team_id,
        project_name,
        cluster, // Department will be mapped to cluster in model
        description,
        outcome,
        hard_soft,
        project_type,
        tl_reg_num
      });

      // Update team with project ID
      await ProjectModel.updateTeamProject(team_id, project_id);

      // Prepare and send requests
      const guideRequests = selectedGuides.map(guide_reg_num => ({
        from_team_id: team_id,
        project_id,
        to_guide_reg_num: guide_reg_num,
        project_name,
        team_semester: semester
      }));
      
      const expertRequests = selectedExperts.map(expert_reg_num => ({
        from_team_id: team_id,
        project_id,
        to_expert_reg_num: expert_reg_num,
        project_name,
        team_semester: semester
      }));

      await Promise.all([
        ProjectModel.sendGuideRequests(guideRequests),
        ProjectModel.sendExpertRequests(expertRequests)
      ]);

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