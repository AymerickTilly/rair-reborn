import { Button, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#423c37" }}
    >
      <Container className="flex-grow-1 d-flex justify-content-center align-items-center py-5 px-3">
        <Card
          className="shadow-sm p-4 w-100"
          style={{
            maxWidth: "500px",
            height: "500px",
            borderRadius: "none",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <h2 className="text-center mb-5">Admin Dashboard</h2>

          <div className="d-grid gap-4">
            <Button variant="dark" size="lg" onClick={() => navigate("/admin/add-item")}>
              <i className="bi bi-plus me-2 text-white"></i> Add Item
            </Button>

            <Button variant="dark" size="lg" onClick={() => navigate("/admin/update-item")}>
              <i className="bi bi-pencil me-2 text-white"></i> Update Item
            </Button>

            <Button variant="dark" size="lg" onClick={() => navigate("/admin/orders")}>
              <i className="bi bi-box-seam me-2 text-white"></i> List Orders
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default AdminPage;
