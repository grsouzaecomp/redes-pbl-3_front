"use client";

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

// ABI do contrato, define a interface das funções disponíveis no contrato.
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
]

// Interface para o tipo de dados de um evento.
interface Event {
  name: string; 
  odds: string; 
  totalAmount: string;
  resolved: boolean; 
  result: number;
}

// Endereços e URLs do contrato e blockchain local (Ganache).
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const ganacheURL = process.env.NEXT_PUBLIC_GANACHE_URL as string;

export default function Home() {
  // Estados para gerenciar a aplicação.
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState('');
  const [odds, setOdds] = useState('');
  const [betValue, setBetValue] = useState<string>('');
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Inicializar Web3 e carregar eventos
  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3(ganacheURL);
      const contractInstance = new web3Instance.eth.Contract(contractABI as AbiItem[], contractAddress);
      setWeb3(web3Instance);
      setContract(contractInstance);

      // Carregar eventos existentes
      const eventCount = Number(await contractInstance.methods.eventCount().call());
      const loadedEvents: Event[] = [];
      for (let i = 0; i < eventCount; i++) {
        const event = (await contractInstance.methods.bettingEvents(i).call()) as unknown as {
          name: string;
          odds: string;
          totalAmount: string;
          resolved: boolean;
          result: string;
        };
        loadedEvents.push({
          name: event.name,
          odds: event.odds,
          totalAmount: event.totalAmount,
          resolved: event.resolved,
          result: parseInt(event.result, 10),
        });
      }
      setEvents(loadedEvents);
    };
    initWeb3();
  }, []);

  // Função para criar um novo evento
  const handleCreateEvent = async () => {
    if (!web3 || !contract || !name || !odds) {
      alert('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();

      // Estimar o gás necessário
      const gasEstimate = await contract.methods.createEvent(name, parseInt(odds, 10)).estimateGas({
        from: accounts[0],
      });

      // Criar o evento no contrato
      await contract.methods.createEvent(name, parseInt(odds, 10)).send({
        from: accounts[0],
        gas: (gasEstimate + BigInt(50000)).toString(), // Buffer de gás
      });

      // Obter o ID do novo evento
      const eventCount = Number(await contract.methods.eventCount().call());

      // Buscar o último evento diretamente pelo ID
      const newEvent = (await contract.methods.bettingEvents(eventCount - 1).call()) as unknown as {
        name: string;
        odds: string;
        totalAmount: string;
        resolved: boolean;
        result: string;
      };

      // Adicionar o novo evento à lista de eventos
      setEvents((prev) => [
        ...prev,
        {
          name: newEvent.name,
          odds: newEvent.odds,
          totalAmount: newEvent.totalAmount,
          resolved: newEvent.resolved,
          result: parseInt(newEvent.result, 10),
        },
      ]);

      alert('Evento criado com sucesso!');
      setName('');
      setOdds('');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para apostar em um evento
  const handlePlaceBet = async (eventId: number) => {
    if (!web3 || !contract || !betValue || !prediction) {
      alert('Preencha todos os campos da aposta!');
      return;
    }
  
    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();
  
      // Converta os valores
      const betAmountInWei = web3.utils.toWei(betValue, 'ether');
      const predictionValue = parseInt(prediction, 10);
  
      // Validações locais
      if (Number(betValue) <= 0) {
        alert('O valor da aposta deve ser maior que 0!');
        return;
      }
      if (predictionValue !== 1 && predictionValue !== 2) {
        alert('Previsão inválida! Escolha 1 ou 2.');
        return;
      }
  
      // Simular a execução da transação
      try {
        await contract.methods.placeBet(eventId, predictionValue).call({
          from: accounts[0],
          value: betAmountInWei,
        });
      } catch (error) {
        console.error('Erro ao simular aposta:', error);        
        return;
      }
  
      // Estimar o gás necessário
      const gasEstimate = await contract.methods.placeBet(eventId, predictionValue).estimateGas({
        from: accounts[0],
        value: betAmountInWei,
      });
  
      // Enviar a transação
      await contract.methods.placeBet(eventId, predictionValue).send({
        from: accounts[0],
        value: betAmountInWei,
        gas: (gasEstimate + BigInt(100000)).toString(),
      });
  
      alert('Aposta realizada com sucesso!');
  
      // Atualizar o total apostado para o evento
      const updatedEvent = (await contract.methods.bettingEvents(eventId).call()) as unknown as {
        name: string;
        odds: string;
        totalAmount: string;
        resolved: boolean;
        result: string;
      };
  
      setEvents((prev) =>
        prev.map((event, index) =>
          index === eventId
            ? {
                ...event,
                totalAmount: updatedEvent.totalAmount, // Atualizar o total apostado
              }
            : event
        )
      );
    } catch (error) {
      console.error('Erro ao fazer aposta:', error);
    } finally {
      setLoading(false);
    }
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
            <p>Odds: {(Number(event.odds) / 100).toFixed(2)}</p>
            <p>Total Apostado: {web3?.utils.fromWei(event.totalAmount, 'ether')} ETH</p>
            <p>Status: {event.resolved ? 'Resolvido' : 'Pendente'}</p>
            <div>
              <input
                type="number"
                placeholder="Previsão (1 ou 2)"
                onChange={(e) => setPrediction(e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor da aposta (ETH)"
                onChange={(e) => setBetValue(e.target.value)}
              />
              <button onClick={() => handlePlaceBet(index)}>
                Apostar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
