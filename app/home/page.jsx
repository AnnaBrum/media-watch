"use client";
import Head from "next/head";
import OneSignal from "react-onesignal";
import { HamburgerMenu } from "@/components/HamburgerMenu/HamburgerMenu";
import styles from "./home.module.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { CostSlider } from "@/components/CostSlider/CostSlider";
import { TotalCostSlider } from "@/components/TotalCostSlider/TotalCostSlider";
import "../globals.css";
import Image from "next/image";
import { redirect } from "next/navigation";
import PushNotice from "@/components/PushNotice/PushNotice";

export default function ClientComponent() {
  const supabase = createClientComponentClient();
  const [subsData, setSubsData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [subsCount, setSubsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // One-signal setup
  useEffect(() => {
    window.OneSignal = window.OneSignal || [];
  
    if (!window.OneSignal.initialized) {
      window.OneSignal.push(() => {
        window.OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });
      });
      window.OneSignal.initialized = true;
    }

    return () => {
       window.OneSignal = undefined;
    };
  }, []); 
  // <-- run this effect once on mount

  useEffect(() => {
    // This code will only be executed on the client side.
    // const supabase = createClientComponentClient();
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // this is a protected route - only users who are signed in can view this route
        console.log("we have session");
      }
      if (!session) {
        // this is a protected route - only users who are signed in can view this route
        redirect("/");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const getData = async () => {
      const { data } = await supabase.from("user_subscriptions").select(`
    id,
    billing_start_date,
    billing_date,
    subscriptions:subscription_id (plan_name, price, services:service_id (service_name, service_icon))
  `);
      if (data) {
        setSubsData(data);
        setIsLoading(false);
      }
    };

    getData();
  }, [supabase, setSubsData]);

  useEffect(() => {
    let amountOfsubs = 0;
    let totalcost = 0;
    subsData.forEach((item) => {
      totalcost += item.subscriptions.price;
      amountOfsubs += 1;
    });
    setTotalCost(totalcost);
    setSubsCount(amountOfsubs);
  }, [subsData]);

  return (
    <>
       {/* <Head>
        <script>
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(function(OneSignal){" "}
          {OneSignal.init({
            appId: "da56e34c-816e-4938-a025-90af555d5f4c",
            safari_web_id:
              "web.onesignal.auto.1997779e-e1de-41f4-ac74-4543cfbf0412",
            notifyButton: {
              enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
          })}
          );
        </script>
      </Head>  */}
      <HamburgerMenu />
      <div className={styles.homeWrapper}>
        <section className={styles.sectionOne}>
          <h1 className={styles.headingOne}>Hem</h1>
          <TotalCostSlider totalCost={totalCost} />
        </section>
        <section className={styles.sectionTwo}>
          <div className={styles.amountOfSubsWrapper}>
            <h2 className={styles.amountOfSubsHeading}>Prenumerationer</h2>
            <h2 className={styles.subAmount}>{subsCount} st</h2>
          </div>
          <ul className={styles.costSliderList}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <Image
                  className={styles.loading}
                  alt="huhu"
                  width={44}
                  height={44}
                  style={{ width: 44, height: 44 }}
                  placeholder="empty"
                  priority={false}
                  src="/images/loading/loading.svg"
                ></Image>
              </div>
            ) : null}
            {subsData.map((item) => (
              <li key={item.id}>
                <CostSlider
                  iconUrl={item.subscriptions.services.service_icon}
                  serviceName={item.subscriptions.services.service_name}
                  cost={item.subscriptions.price}
                />
              </li>
            ))}
          </ul>
          <div
            className={`onesignal-customlink-container ${styles.pushWrapper}`}
          >
            <PushNotice />
          </div>
        </section>
      </div>
    </>
  );
}
