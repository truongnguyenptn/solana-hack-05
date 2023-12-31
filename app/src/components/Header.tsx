import { ReactNode, useContext, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import WalletMultiButtonDynamic from './WalletMultiButtonDynamic';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Elusiv, SEED_MESSAGE, TopupTxData } from '@elusiv/sdk';
import { AppContext } from '@/contexts/AppProvider';
import { useToggle } from 'usehooks-ts';
import AuditingRequest from './AuditingRequest';
import { getUserRole } from '@/utils';
import { ROLE } from '@/types';
import StakingNFT from './StakingNFT';
import { Router, useRouter } from 'next/router';
import Topup from './Topup';
import { getBankAccount } from '@/utils/program/getBankAccount';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import ViewPrivateTransaction from './ViewPrivateTransaction';
const Links = ['NFTLoansX', 'Projects', 'Team'];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    textColor={'gray.900'}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.200',
    }}
    href={'#'}
  >
    {children}
    {/* {console.log('header: ', children)} */}
  </Link>
);

export default function Header() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { publicKey, signMessage } = useWallet();
  const toast = useToast();
  const { connection } = useConnection();
  const {
    wallet: { setElusiv, elusiv },
  } = useContext(AppContext);

  const initElusiv = async () => {
    if (!publicKey || !signMessage) return;
    const encodedMessage = new TextEncoder().encode(SEED_MESSAGE);

    try {
      const seed = await signMessage(encodedMessage);
      const elusivInstance = await Elusiv.getElusivInstance(
        seed,
        publicKey,
        connection,
        'devnet'
      );
      setElusiv(elusivInstance);
    } catch (error) {
      toast({
        title: 'Reject use Elusiv Payment',
        description: 'You reject to provide seed and key for Elusiv',
        status: 'info',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
  };
  const [isAuditingRequestodalVisible, toggleAuditingRequestodalVisible] =
    useToggle();

  const [accounts, setAccounts] = useState<any[]>([]);

	const [currentAccount, setCurrentAccount] = useState<any>();

	const wallet = {
		publicKey: '3sFDKYCFkWHwfVWzkWj7RL3poZtgWDqJmgPny2DVcV87',
	};
	const [num, setNum] = useState<number>(0);

	useEffect(() => {
		if (!wallet) return;

		const run = async () => {
			const { sig, error } = await getBankAccount(wallet as unknown as NodeWallet);
			if (error) return;
			console.log(sig);
			setAccounts(sig);
			setCurrentAccount(
				sig.find((s: any) => s.threadId == router.query.default)
			);
		};
		run();
	}, [wallet]);
  return (
		<>
			<Box
				bg={'#799EB2'}
				px={6}
				py={4}
				borderBottom="1px solid"
				borderColor="#799EB2"
			>
				<Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
					<IconButton
						size={'md'}
						icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
						aria-label={'Open Menu'}
						display={{ md: 'none' }}
						onClick={isOpen ? onClose : onOpen}
					/>
					<HStack spacing={8} alignItems={'center'}>
						<h1 className="font-bold">PrivaXy</h1>
						<HStack
							as={'nav'}
							spacing={4}
							display={{ base: 'none', md: 'flex' }}
						>
							{/* {getUserRole() === ROLE.LENDER && (
                <AuditingRequest
                  isAuditingRequestodalVisible={isAuditingRequestodalVisible}
                  toggleAuditingRequestodalVisible={
                    toggleAuditingRequestodalVisible
                  }
                />
              )} */}
							{/* <StakingNFT /> */}
						</HStack>
						<HStack>
							<StakingNFT
								isAuditingRequestodalVisible={isAuditingRequestodalVisible}
								toggleAuditingRequestodalVisible={
									toggleAuditingRequestodalVisible
								}
							/>
						</HStack>
						<Topup />
						<ViewPrivateTransaction/>
					</HStack>
					<Flex alignItems={'center'}>
						<div className="mr-2">
							<div className="flex-row flex">
								{!elusiv && (
									<button className="elusiv-button mr-4" onClick={initElusiv}>
										Connect to Elusiv
									</button>
								)}

								<WalletMultiButtonDynamic />
							</div>
						</div>
						<Menu>
							<MenuButton
								as={Button}
								rounded={'full'}
								variant={'link'}
								cursor={'pointer'}
								minW={0}
							>
								<Avatar
									size={'md'}
									borderRadius={8}
									src={
										getUserRole() === ROLE.LENDER
											? 'https://i.redd.it/img8odfcyzi71.jpg'
											: 'https://media.howrare.is/nft_images/madlads/283b4a1de2ffd759a7b00bf428ba1bf6.jpg'
									}
								/>
							</MenuButton>
							<MenuList>
								<MenuItem
									onClick={() => {
										router.push('/profile');
									}}
								>
									Profile
								</MenuItem>
								<MenuItem>{accounts[0]?.balance} pSOL
								<img src="https://www.seekpng.com/png/detail/139-1398308_shiny-token-token-icon-png.png" alt="Shiny Token - Token Icon Png@seekpng.com"
								className="w-6 h-6"
								/>
								 </MenuItem>
								<MenuItem>Settings</MenuItem>
								<MenuDivider />
								<MenuItem>Logout</MenuItem>
							</MenuList>
						</Menu>
					</Flex>
				</Flex>

				{isOpen ? (
					<Box pb={4} display={{ md: 'none' }}>
						<Stack as={'nav'} spacing={4}>
							{Links.map((link) => (
								<NavLink key={link}>{link}</NavLink>
							))}
						</Stack>
					</Box>
				) : null}
			</Box>
		</>
	);
}
