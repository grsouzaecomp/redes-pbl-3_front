"use client";

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

// ABI do contrato (copie do Hardhat artifacts)
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "prediction",
        "type": "uint8"
      }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "name": "ContractBalance",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "odds",
        "type": "uint256"
      }
    ],
    "name": "EventCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "result",
        "type": "uint8"
      }
    ],
    "name": "EventResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      }
    ],
    "name": "Payout",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalAttempt",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bettingEvents",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "odds",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "resolved",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "result",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_odds",
        "type": "uint256"
      }
    ],
    "name": "createEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "eventBets",
    "outputs": [
      {
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "prediction",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eventCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getEventBets",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "bettor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "prediction",
            "type": "uint8"
          }
        ],
        "internalType": "struct DescentralizedBet.Bet[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "prediction",
        "type": "uint8"
      }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "result",
        "type": "uint8"
      }
    ],
    "name": "resolveEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

interface Event {
  name: string; 
  odds: string; 
  totalAmount: string;
  resolved: boolean; 
  result: number;
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const ganacheURL = process.env.NEXT_PUBLIC_GANACHE_URL as string;

export default function Home() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState('');
  const [odds, setOdds] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3(ganacheURL);
      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setWeb3(web3Instance);
      setContract(contractInstance);
  
      // Carregar eventos existentes
      const eventCount = Number(await contractInstance.methods.eventCount().call());
      const loadedEvents: Event[] = [];
      for (let i = 0; i < eventCount; i++) {
        // Forçamos o tipo do retorno de bettingEvents
        const event = (await contractInstance.methods.bettingEvents(i).call()) as unknown as {
          name: string;
          odds: string;
          totalAmount: string;
          resolved: boolean;
          result: string;
        };
        loadedEvents.push({
          name: event.name, // Nome do evento
          odds: event.odds, // Odds retornados como string
          totalAmount: event.totalAmount, // Valor total apostado (string em wei)
          resolved: event.resolved, // Status do evento
          result: parseInt(event.result, 10), // Resultado como número
        });
      }
      setEvents(loadedEvents);
    };
    initWeb3();
  }, []);
  
  const handleCreateEvent = async () => {
    if (!web3 || !contract || !name || !odds) return;
    setLoading(true);
    try {
        const accounts = await web3.eth.getAccounts();

        // Estimar o gás necessário
        const gasEstimate = await contract.methods.createEvent(name, odds).estimateGas({ from: accounts[0] });

        // Converter o limite de gás para string e enviar a transação
        await contract.methods.createEvent(name, odds).send({
            from: accounts[0],
            gas: (gasEstimate + BigInt(50000)).toString(), // Convertendo para string
        });

        alert('Evento criado com sucesso!');
    } catch (error) {
        console.error(error);
    }
    setLoading(false);
};

  return (
    <div>
      <h1>Apostas Descentralizadas</h1>
      <section>
        <h2>Criar Evento</h2>
        <input
          type="text"
          placeholder="Nome do evento"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Odds (%)"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
        />
        <button onClick={handleCreateEvent} disabled={loading}>
          {loading ? 'Criando...' : 'Criar Evento'}
        </button>
      </section>

      <section>
        <h2>Eventos Ativos</h2>
        {events.length === 0 && <p>Nenhum evento encontrado.</p>}
        {events.map((event, index) => (
          <div key={index}>
            <p>Nome: {event.name}</p>
            <p>Odds: {Number(event.odds) / 100}</p> {/* Odds convertido para número */}
            <p>Total Apostado: {web3?.utils.fromWei(event.totalAmount, 'ether')} ETH</p>
            <p>Status: {event.resolved ? 'Resolvido' : 'Pendente'}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
