import { ChakraProvider } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

const Provider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    return (
        <ChakraProvider>
            {children}
        </ChakraProvider>
    )
}

export default Provider;
