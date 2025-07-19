import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, DatePicker, TimePicker, Select, message, Card, Spin } from 'antd';
import dayjs from 'dayjs';
import api from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { TextArea } = Input;

const SubExpertScheduleOptionalReview = () => {
  const user_reg_num = useSelector((state) => state.userSlice?.reg_num);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [userType, setUserType] = useState(null);

  // Fetch students available for review
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sub-expert/students_for_review/${user_reg_num}`);
        if (response.data.status) {
          setStudents(response.data.data);
          setUserType(response.data.user_type);
        } else {
          message.error(response.data.error || 'Failed to fetch students');
        }
      } catch (error) {
        message.error('Error fetching students');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user_reg_num]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formattedData = {
        request_id: values.request_id,
        venue: values.venue,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm:ss'),
        meeting_link: values.meeting_link
      };

      const response = await api.post(`/api/optional-reviews/schedule_review/${user_reg_num}`, formattedData);
      
      if (response.data.status) {
        message.success('Review scheduled successfully!');
        form.resetFields();
      } else {
        message.error(response.data.error || 'Failed to schedule review');
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Error scheduling review');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    // Cannot select days before today
    return current && current < dayjs().startOf('day');
  };

  return (
    <Card 
      title="Schedule Optional Review (Sub-Expert)" 
      bordered={false}
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Select Student/Team"
            name="request_id"
            rules={[{ required: true, message: 'Please select a student/team' }]}
          >
            <Select
              placeholder="Select a student/team"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {students.map((student) => (
                <Option key={student.request_id} value={student.request_id}>
                  {`${student.student_reg_num} - Team: ${student.team_id} (${student.review_type})`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Venue"
            name="venue"
            rules={[{ required: true, message: 'Please input venue details' }]}
          >
            <Input placeholder="Enter venue details" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: 'Please select time' }]}
          >
            <TimePicker 
              style={{ width: '100%' }} 
              format="HH:mm" 
            />
          </Form.Item>

          <Form.Item
            label="Meeting Link (if online)"
            name="meeting_link"
          >
            <Input placeholder="Enter meeting link (if applicable)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Schedule Review
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default SubExpertScheduleOptionalReview;