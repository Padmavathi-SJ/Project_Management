import React, { useState } from 'react';
import Select from 'react-select';
import instance from '../../utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../utils/userSlice';

const SelectProjectType = () => {
    const user = useSelector((State) => State.userSlice);
    const dispatch = useDispatch();
    const projectTypes = [
        { value: 'internal', label: 'Internal' },
        { value: 'external', label: 'External' }
    ];

    const [selectedType, setSelectedType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (selectedOption) => {
        setSelectedType(selectedOption);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedType) {
            alert('Please select a project type');
            return;
        }

        setIsSubmitting(true);
        console.log(selectedType, user.id);
        try {
            const response = await instance.put('/profile/update-project-type', {
                project_type: selectedType.value,
                userId: user.id

            });
            dispatch(addUser(response.data.data))
            console.log(response);
            // return response.data;
        } catch (error) {
            console.error('Error updating project type:', error);
            throw error;
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mb-6">
            <h2 className="text-xl bg-white font-semibold mb-4">Select Project Type</h2>
            <form onSubmit={handleSubmit}>
                <Select
                    classNames="bg-white"
                    options={projectTypes}
                    onChange={handleChange}
                    value={selectedType}
                    placeholder="Select Project Type..."
                    className="basic-select"
                    classNamePrefix="select"
                    isDisabled={isSubmitting}
                    isSearchable={false}  // Optional: disable search if you have few options
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full mt-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default SelectProjectType;