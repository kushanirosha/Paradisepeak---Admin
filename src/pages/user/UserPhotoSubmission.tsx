/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Navbar from "../../components/Navbar";
import ApiService from "../../services/ApiService";
import { errorToastMsg, successMsg } from "../../helpers/utils";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Pagination from "../../components/Pagination"
type SharePhotoForm = {
  package: string;
  drivelink: string;
  description: string;
  _id?: string;
};

const defaultForm: SharePhotoForm = {
  package: "",
  drivelink: "",
  description: "",
};

const validationSchema = Yup.object().shape({
  package: Yup.string().required("Package is required"),
  drivelink: Yup.string()
    .required("Drive link is required")
    .url("Enter a valid URL"),
  description: Yup.string()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters"),
});

const UserPhotoSubmission: React.FC = () => {
  const [sharePhotos, setSharePhotos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);


  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const  lastindex = currentPage * itemsPerPage;
  const  firstindex = lastindex - itemsPerPage;
  const currentsharephoto= (sharePhotos.slice(firstindex,lastindex));
  useEffect(() => {
    
    ApiService.getPackages().then((elm) => {
      const List = elm.map((elm: any) => ({
        value: elm._id,
        name: elm.title,
      }));
      setPackages(List);
    });

   
    ApiService.getSharePhotos()
      .then((res) => {
        if (res && res.data) {
          setSharePhotos(res.data);
           setTotalPages(Math.ceil(res.data.length / itemsPerPage))
        }
      })
      .catch((err) => console.error("Error fetching share photos:", err));
  }, []);

  const openAddModal = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
const handleSubmitForm = async (
    values: SharePhotoForm,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const payload = {
        packageId: values.package,
        drivelink: values.drivelink,
        description: values.description,
        user: localStorage.getItem("userid"),
      };

      const resp = await ApiService.addSharePhoto(payload);

      if (resp.success) {
        successMsg(resp.message);
        setSharePhotos((prev) => [...prev, resp.data]);
        resetForm();
        handleModalClose();
      } else {
        errorToastMsg(resp.message);
      }
    } catch (err: any) {
      errorToastMsg(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f8f9fb",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "1rem 2.5rem 2rem 18.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Share Photos</h1>
          <p style={{ color: "#555", marginBottom: "2rem" }}>
            Share Your Photos
          </p>

         
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
              Share Your Photos
            </h2>
            <button
              style={{
                background: "#2155cd",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.7rem 1.5rem",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={openAddModal}
            >
              <FaPlus style={{ fontSize: 20 }} /> Add Your Photos
            </button>
          </div>

         
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 4px #0001",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f3f4f6" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "1rem" }}>
                    Package Name
                  </th>
                  <th style={{ textAlign: "left", padding: "1rem" }}>
                    Google Drive Link
                  </th>
                  <th style={{ textAlign: "left", padding: "1rem" }}>
                    Description
                  </th>
                </tr>
              </thead>
           <tbody>
                    {currentsharephoto.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#888",
                          }}
                        >
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      currentsharephoto.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                          <td style={{ padding: "1rem" }}>
                            {item.package?.title || item.package}
                          </td>
                          <td style={{ padding: "1rem" }}>{item.drivelink}</td>
                          <td style={{ padding: "1rem" }}>{item.description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>

            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              />
          </div>
        </div>
      </div>

     {/* model */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 400,
              maxWidth: 480,
              boxShadow: "0 2px 16px #0002",
              position: "relative",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>
              Add Share Photos
            </h3>

            <Formik
              initialValues={defaultForm}
              validationSchema={validationSchema}
              onSubmit={handleSubmitForm}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div style={{ marginBottom: 8 }}>
                    <Field
                      as="select"
                      name="package"
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    >
                      <option value="">Select a package</option>
                      {packages.map((item) => (
                        <option value={item.value} key={item.value}>
                          {item.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="package"
                      component="div"
                      // style={{ color: "red" }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <Field
                      type="text"
                      name="drivelink"
                      placeholder="Google Drive Link"
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    />
                    <ErrorMessage
                      name="drivelink"
                      component="div"
                      // style={{ color: "red" }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <Field
                      as="textarea"
                      name="description"
                      placeholder="Description..."
                      rows={5}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      // style={{ color: "red" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleModalClose}
                      style={{
                        background: "#fff",
                        color: "#222",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: "8px 18px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: "#2155cd",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 18px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPhotoSubmission;
