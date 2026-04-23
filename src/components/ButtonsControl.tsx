import { Button, Flex } from "@chakra-ui/react";
import { FC } from "react";

const ButtonsControl: FC<{
    onOpen: () => void;
    onPick: () => void;
    isOpenDisabled: boolean;
    isPickDisabled: boolean;
    isPityReady: boolean;
}> = ({ onOpen, onPick, isOpenDisabled, isPickDisabled, isPityReady }) => {
    return (
        <Flex position='absolute' zIndex={10} right={{ base: '16px', lg: '64px' }} bottom={{ base: '16px', lg: '64px' }} gap={{ base: '8px', lg: '16px' }}>
            <Button
                w='92px'
                h='92px'
                rounded='full'
                onClick={onOpen}
                isDisabled={isOpenDisabled}
                bg='linear-gradient(145deg, #f6d2b4, #d87884)'
                color='#241214'
                _hover={{ filter: 'brightness(1.04)' }}
                _disabled={{ opacity: 0.55, filter: 'saturate(0.7)' }}
                boxShadow='0 18px 38px rgba(13, 7, 15, 0.28)'
                fontFamily={`"Baskerville", "Palatino Linotype", serif`}
                lineHeight='1.1'
            >
                Open
            </Button>
            <Button
                w='92px'
                h='92px'
                rounded='full'
                onClick={onPick}
                isDisabled={isPickDisabled}
                bg={isPityReady
                    ? 'linear-gradient(145deg, #fff1be, #ffae61)'
                    : 'linear-gradient(145deg, #c5deff, #6d9eff)'}
                color='#101a2f'
                _hover={{ filter: 'brightness(1.04)' }}
                _disabled={{ opacity: 0.55, filter: 'saturate(0.7)' }}
                boxShadow={isPityReady
                    ? '0 0 24px rgba(255, 216, 122, 0.66), 0 18px 38px rgba(13, 7, 15, 0.28)'
                    : '0 18px 38px rgba(13, 7, 15, 0.28)'}
                fontFamily={`"Baskerville", "Palatino Linotype", serif`}
                lineHeight='1.1'
            >
                Pick
            </Button>
        </Flex>
    )
}

export default ButtonsControl;
