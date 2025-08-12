import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, TimePicker, Select, message, Card, Spin } from 'antd';
import dayjs from 'dayjs';
import api from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

const { Option } = Select;

const ScheduleOptionalReview = () => {
  const user_reg_num = useSelector((state) => state.userSlice?.reg_num);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/guide/students_for_review/${user_reg_num}`);
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

      // Prepare payload according to backend expectations
      const payload = {
        request_id: values.request_id,
        review_mode: values.review_mode,
        venue: values.review_mode === 'offline' ? values.venue : null,
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.start_time.format('HH:mm:ss'),
        end_time: values.end_time.format('HH:mm:ss'),
        meeting_link: values.review_mode === 'online' ? values.meeting_link : null
      };

      const response = await api.post(`/api/optional-reviews/schedule_review/${user_reg_num}`, payload);

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
    return current && current < dayjs().startOf('day');
  };

  return (
    <Card
      title="Schedule Optional Review"
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
            label="Review Mode"
            name="review_mode"
            rules={[{ required: true, message: 'Please select review mode' }]}
          >
            <Select placeholder="Select review mode">
              <Option value="online">Online</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Venue"
            name="venue"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('review_mode') === 'offline' && !value) {
                    return Promise.reject('Please input venue details for offline review');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input placeholder="Enter venue details (offline only)" />
          </Form.Item>

          <Form.Item
            label="Meeting Link (if online)"
            name="meeting_link"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('review_mode') === 'online' && !value) {
                    return Promise.reject('Please enter meeting link for online review');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input placeholder="Enter meeting link (online only)" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
          </Form.Item>

          <Form.Item
            label="Start Time"
            name="start_time"
            rules={[{ required: true, message: 'Please select start time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="end_time"
            rules={[{ required: true, message: 'Please select end time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
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

export default ScheduleOptionalReview;