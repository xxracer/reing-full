
import React from 'react';
import ImageEditor from '../../components/admin/ImageEditor';

const ManagePrograms = () => {
  return (
    <div>
      <h1>Manage Program Pages</h1>
      <p>Here you can edit the main images for each program page.</p>

      <ImageEditor
        sectionId="program_kids_image"
        title="Kids Program Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_homeschool_image"
        title="Homeschool Program Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_adult_image"
        title="Adult Program Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_fundamentals_image"
        title="Fundamentals Program Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_competition_image"
        title="Competition Training Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_wrestling_image"
        title="Wrestling Program Page Image"
        showPositionControl={true}
      />

      <ImageEditor
        sectionId="program_private_lessons_image"
        title="Private Lessons Page Image"
        showPositionControl={true}
      />

    </div>
  );
};

export default ManagePrograms;
