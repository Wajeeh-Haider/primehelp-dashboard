import React from 'react';
import CardDataStats from '../CardDataStats';
import swr from 'swr';
import { API_URL, fetcherWithCredentials } from '../../constants';
import Loader from '../common/Loader';
import Alert from '../Alert';
import { MdAttachMoney } from 'react-icons/md';
import { GiMeal } from 'react-icons/gi';
import { CiUser } from 'react-icons/ci';
import ChartThree from '../Charts/ChartThree';
import { BiSolidFoodMenu } from 'react-icons/bi';

const ECommerce: React.FC = () => {
  const { data, isLoading } = swr(`${API_URL}/stats`, fetcherWithCredentials);

  if (isLoading) return <Loader />;

  return (
    <div className="h-screen">
      {data?.error && (
        <Alert title="Something went wrong" message={data?.message} />
      )}

      {!data?.error && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <CardDataStats
              title="Total Meals"
              total={"20"}
              rate="0.43%"
              levelUp
              path="meals"
            >
              <GiMeal className="size-5 text-[#40A579] dark:text-white" />
            </CardDataStats>
            <CardDataStats
              title="Total Recipes"
              total={data?.data?.recipes}
              rate="4.35%"
              levelUp
              path="recipes"
            >
              <BiSolidFoodMenu className="size-5 text-[#40A579] dark:text-white" />
            </CardDataStats>
            <CardDataStats
              title="Subscriptions"
              total={`$${data?.data?.subscribedUsers?.totalRevenue || 0}`}
              rate="2.59%"
              levelUp
            >
              <MdAttachMoney className="size-5 text-[#40A579] dark:text-white" />
            </CardDataStats>
            <CardDataStats
              title="Total Users"
              total={data?.data?.users}
              rate="0.95%"
              levelDown
              path="users"
            >
              <CiUser className="size-5 text-[#40A579] dark:text-white" />
            </CardDataStats>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
            <ChartThree
              userCount={data?.data?.users}
              subscribedUserCount={data?.data?.subscribedUsers?.totalUsers}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ECommerce;
