import { Box, Text } from '@chakra-ui/react';
import { RevealingReward } from '../types/game';

interface RewardLetterCardProps {
    reward: RevealingReward;
}

const RewardLetterCard = ({ reward }: RewardLetterCardProps) => {
    return (
        <Box
            position='absolute'
            zIndex={17}
            top='50%'
            left='50%'
            transform='translate(-50%, -50%) rotate(-1deg)'
            w={{ base: 'min(88vw, 390px)', md: '420px' }}
            maxH={{ base: 'calc(100svh - 112px)', md: 'min(640px, calc(100svh - 150px))' }}
            px={{ base: 6, md: 9 }}
            py={{ base: 6, md: 9 }}
            overflowY='auto'
            overscrollBehavior='contain'
            bg='linear-gradient(145deg, #fffaf2 0%, #f7dfc7 52%, #f1caa8 100%)'
            color='#3a211a'
            border='1px solid rgba(104, 55, 33, 0.22)'
            borderRadius='6px'
            boxShadow={`0 0 34px ${reward.glow}, 0 28px 78px rgba(28, 12, 18, 0.42), inset 0 0 0 1px rgba(255,255,255,0.54)`}
            fontFamily={`"Yu Mincho", "Noto Serif TC", "PMingLiU", serif`}
            sx={{
                touchAction: 'pan-y',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '12px',
                    border: '1px solid rgba(115, 67, 41, 0.16)',
                    pointerEvents: 'none',
                },
                '@media (orientation: landscape) and (max-height: 520px)': {
                    width: 'min(64vw, 520px)',
                    maxHeight: 'calc(100svh - 86px)',
                    paddingInline: '24px',
                    paddingBlock: '22px',
                },
            }}
        >
            <Text fontSize={{ base: '15px', md: '16px' }} letterSpacing='0.08em' color='rgba(58, 33, 26, 0.66)'>
                {reward.label}
            </Text>
            <Text mt={5} fontSize={{ base: '18px', md: '20px' }} lineHeight='1.7'>
                親愛的小水獺：
            </Text>
            <Text
                mt={5}
                fontSize={{ base: '17px', md: '19px' }}
                lineHeight={{ base: '2', md: '2.05' }}
                whiteSpace='pre-wrap'
            >
                {reward.message}
            </Text>
            <Text mt={7} fontSize={{ base: '18px', md: '20px' }} lineHeight='1.7' textAlign='right'>
                愛妳的凱文
            </Text>
        </Box>
    );
};

export default RewardLetterCard;
