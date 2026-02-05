import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ProgramContentEditor from '../../components/admin/ProgramContentEditor';

const ManageProgramContent = () => {
    const { programId } = useParams();

    const programs = {
        'kids': 'Kids Program',
        'homeschool': 'Homeschool Program',
        'adult': 'Adult Program',
        'fundamentals': 'Fundamentals Program',
        'competition': 'Competition Training',
        'wrestling': 'Wrestling Program',
        'private-lessons': 'Private Lessons'
    };

    if (!programs[programId]) {
        return <Navigate to="/admin/programs" />;
    }

    return (
        <div className="manage-program-content">
            <ProgramContentEditor
                programId={programId}
                title={programs[programId]}
            />
        </div>
    );
};

export default ManageProgramContent;
