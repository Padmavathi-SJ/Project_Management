--> now need to write a model, controller and router to acheive the below operation.
--> The idea is a student can apply for challenge review for only one time for a semester, those requests are stored in the above table---> these feilds already done and also attatched below for your reference.
--> the request details (cluster wise, review_type --> students(challenge review requests) count) will be fetched and display detaily for admin --> then admin will assign reviewers --> 'pmc1', 'pmc2' to conduct challenge reviews as by "ratio" --> like 5(students/challenge review requests count) : 1(pmc1, pmc2) --> for  5 students 1 pmc1, 1 pmc2.
--> here pmc1 and pmc2 are staffs from the clusters.
--> pmc1 and pmc2 both should be assigned automatically from same cluster in which cluster requested student is done their project.
--> this ratio type is to reduce workload of assigning for each and individual student.
--> case: 1 --> if toal count is 7 in EEE, admin is giving ratio as 5:1, balance is 2 --> for that 2 students admin need to give the ratio again like 2:1 --> because admin known bal is 2 so directly admin can give the ratio 2:1.
---> Admin no need to assign manually for any student.
---> then need to write a sql query to create a table to store these challenge_review_reviewers_assignment with feilds --> semester, team_id, project_id, project_type, review_type, student_reg_num, pmc1_reg_num, pmc2_reg_num.
--> then respective pmc1, pmc2 will get the notifications--> they will schedule the review --> then will update marks -> these fields will be implemented later.
--> now clearly implement model, controller and router to perform the above challenge review process.



--> challenge review process:
--> challenge reviews will be enabled for review by review (review-1 , after completing review-1 review-2 will be enabled)by admin. so we will conduct challenge reviews for review by review(1.review-1, 2.review-2).
--> challenge_review requests done by students --> this module is already completed.
--> now need to assign reviewers:
 process :
  --> staffs have their designation like --> 'head','professor','Associate Professor','Assistant professor level III','assistant professor level II','assistant professor level I','assistant professor', we have clusters, each cluster have set of departments.
--> ex: challenge_review requests for review-1, from cluster-5(CS departments) --> need to asign PMC1(reviewer-1), PMC2(reviewer-2) from the custer-5 as 1 junior(PMC1), 1 senior(PMC2) --> like head-assistant professor, professor-assistant professor level I, associate professor-assistant professor level II and like wise---> a staff from ascending-1 staff from descending --> in the case of staffs in the equal designation--> just asign reviewer-1 and reviewer-2 from the same designation.
--> reviewer assignment will be done by ratio --> for 5 requests from cluster-1- 1 PMC1, 2 PMC2 --> this ratio will be selected by admin--> so that for that 5 requests 1 pair of reviewers will be assigned.
--> now for this type of reviewer assignment need to write model, controller and router.
--> write model, controller in the below format only.