import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      api.get('/foods').then(response => {
        setFoods(response.data);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      Object.assign(food, { available: true });
      const response = await api.post('/foods', food);
      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const updatedFoods: IFoodPlate[] = [];

    const { name, image, price, description } = food;

    const updatedFood = {
      id: editingFood.id,
      name,
      image,
      price,
      description,
      available: editingFood.available,
    };

    await api.put(`/foods/${updatedFood.id}`, updatedFood);

    foods.forEach(checkFood => {
      if (checkFood.id === editingFood.id) {
        updatedFoods.push(updatedFood);
      } else {
        updatedFoods.push(checkFood);
      }
    });

    setFoods(updatedFoods);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    const foodIndex = foods.findIndex(food => food.id === id);

    const updatedFoods = [...foods];
    updatedFoods.splice(foodIndex, 1);
    setFoods(updatedFoods);
  }

  async function handleToggleAvailable(id: number): Promise<void> {
    await api.put(`/foods/${id}`);

    const updatedFood = foods.find(food => food.id === id);

    if (updatedFood) {
      updatedFood.available = !updatedFood.available;
      await api.put(`/foods/${updatedFood.id}`, updatedFood);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleToggleAvailable={handleToggleAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
