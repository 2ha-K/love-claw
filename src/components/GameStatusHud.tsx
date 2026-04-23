import { Box, Flex, Text } from '@chakra-ui/react';

interface GameStatusHudProps {
    pityProgress: number;
    isPityReady: boolean;
}

const GameStatusHud = ({ pityProgress, isPityReady }: GameStatusHudProps) => {
    return (
        <Flex
            position='absolute'
            top={{ base: '18px', lg: '28px' }}
            left='50%'
            transform='translateX(-50%)'
            zIndex={12}
            gap={3}
            align='stretch'
            w={{ base: 'calc(100% - 32px)', md: 'auto' }}
            maxW='320px'
        >
            <Box
                px={{ base: 5, lg: 6 }}
                py={4}
                minW={{ base: 'auto', md: '280px' }}
                bg={isPityReady
                    ? 'linear-gradient(135deg, rgba(84, 39, 6, 0.92), rgba(170, 104, 39, 0.78))'
                    : 'linear-gradient(135deg, rgba(17, 16, 31, 0.88), rgba(17, 36, 46, 0.72))'}
                border={isPityReady ? '1px solid rgba(255, 229, 156, 0.65)' : '1px solid rgba(255,255,255,0.12)'}
                borderRadius='28px'
                backdropFilter='blur(18px)'
                boxShadow={isPityReady
                    ? '0 0 0 1px rgba(255, 221, 150, 0.25), 0 0 34px rgba(255, 196, 89, 0.35), 0 18px 50px rgba(7, 6, 18, 0.42)'
                    : '0 18px 50px rgba(7, 6, 18, 0.35)'}
            >
                <Text
                    color={isPityReady ? '#fff2c4' : 'rgba(222, 240, 255, 0.75)'}
                    fontSize='11px'
                    letterSpacing='0.32em'
                    textTransform='uppercase'
                    fontFamily={`"Avenir Next", "Segoe UI", sans-serif`}
                >
                    Promise Light
                </Text>
                <Flex mt={2} align='baseline' gap={3}>
                    <Text
                        color={isPityReady ? '#fff6de' : '#ebf6ff'}
                        fontSize={{ base: '32px', lg: '38px' }}
                        lineHeight='1'
                        fontFamily={`"Baskerville", "Palatino Linotype", serif`}
                        textShadow={isPityReady ? '0 0 24px rgba(255, 230, 164, 0.75)' : 'none'}
                    >
                        {pityProgress}/10
                    </Text>
                    <Text color={isPityReady ? '#fff1d0' : 'rgba(222, 240, 255, 0.72)'} fontSize='13px'>
                        {isPityReady ? 'guaranteed glow' : 'charging softly'}
                    </Text>
                </Flex>
            </Box>
        </Flex>
    );
};

export default GameStatusHud;
