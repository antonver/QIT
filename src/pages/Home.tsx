import ChatBar from "../components/ChatBar.tsx";
import {Box} from "@mui/material";

const Home = () => {
    return (
        <><Box sx={{
            justifyContent: "flex-end",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: '92vh',
        }}>
            <ChatBar onAttachmentClick={function(): void {
                throw new Error("Function not implemented.");
            } }/>
        </Box>
        </>
    );
};

export default Home;