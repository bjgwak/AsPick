import { AppBar, Toolbar, Typography, Container } from "@mui/material";
import styled from "styled-components";
import { spacing } from "../tokens";

const Content = styled(Container)`
  margin-top: ${spacing.xl * 2.5}px;
`;

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title = "AsPick", children }) => {
  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Content maxWidth="sm">{children}</Content>
    </>
  );
};

export default Layout;
